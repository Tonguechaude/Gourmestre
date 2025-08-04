-- Create database and user if they don't exist
-- Run this as postgres superuser

-- Create user
CREATE USER u_gourmestre WITH PASSWORD 'tongue';

-- Create database
CREATE DATABASE "Gourmestre" OWNER u_gourmestre;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "Gourmestre" TO u_gourmestre;

-- Connect to the new database
\c "Gourmestre"

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO u_gourmestre;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO u_gourmestre;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO u_gourmestre;