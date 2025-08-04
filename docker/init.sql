DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = 'gourmestre_app') THEN
        CREATE USER gourmestre_app WITH
            LOGIN
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            NOINHERIT
            NOREPLICATION
            CONNECTION LIMIT 10
            PASSWORD 'CHANGE_ME_APP_PASSWORD_32_CHARS_MIN';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    -- CHECK (
    --     email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    --     length(email) <= 254
    -- ),
    username TEXT NOT NULL UNIQUE CHECK (
        length(username) >= 3 AND
        length(username) <= 50 AND
        username ~ '^[A-Za-z0-9_-]+$'
    ),
    password_hash TEXT NOT NULL CHECK (length(password_hash) >= 50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    account_locked_until TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 200),
    city TEXT NOT NULL CHECK (length(city) >= 1 AND length(city) <= 100),
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    description TEXT CHECK (length(description) <= 1000),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 200),
    city TEXT NOT NULL CHECK (length(city) >= 1 AND length(city) <= 100),
    notes TEXT CHECK (length(notes) <= 1000),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE CHECK (length(token) >= 32),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL CHECK (expires_at > created_at),
    ip_address INET,
    user_agent TEXT CHECK (length(user_agent) <= 500),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_favorite ON restaurants(owner_id, is_favorite) WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS idx_wishlist_items_owner ON wishlist_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_priority ON wishlist_items(owner_id, priority);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE OR REPLACE FUNCTION check_user_sessions() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM sessions
        WHERE user_id = NEW.user_id
        AND expires_at > NOW()
        AND is_active = TRUE) >= 5 THEN
        RAISE EXCEPTION 'Trop de sessions actives pour cet utilisateur';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_user_sessions
    BEFORE INSERT ON sessions
    FOR EACH ROW EXECUTE FUNCTION check_user_sessions();

GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO gourmestre_app;
GRANT USAGE ON SCHEMA public TO gourmestre_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO gourmestre_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurants TO gourmestre_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlist_items TO gourmestre_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO gourmestre_app;

GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO gourmestre_app;
GRANT USAGE, SELECT ON SEQUENCE restaurants_id_seq TO gourmestre_app;
GRANT USAGE, SELECT ON SEQUENCE wishlist_items_id_seq TO gourmestre_app;
GRANT USAGE, SELECT ON SEQUENCE sessions_id_seq TO gourmestre_app;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE ${POSTGRES_DB} FROM PUBLIC;

CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at <= NOW() OR is_active = FALSE;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, user_id, old_values)
        VALUES (TG_TABLE_NAME, TG_OP, OLD.id, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, user_id, old_values, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, user_id, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER sessions_audit_trigger
    AFTER INSERT OR DELETE ON sessions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

GRANT SELECT, INSERT ON audit_log TO gourmestre_app;
GRANT USAGE, SELECT ON SEQUENCE audit_log_id_seq TO gourmestre_app;
