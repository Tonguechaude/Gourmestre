use crate::domain::user::{User, UserId, CreateUser};
use crate::error::Result;
use crate::database::DbPool;
use async_trait::async_trait;
use sqlx::Row;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn create(&self, user: CreateUser) -> Result<User>;
    async fn find_by_id(&self, id: UserId) -> Result<Option<User>>;
    async fn find_by_username(&self, username: &str) -> Result<Option<User>>;
    async fn find_by_email(&self, email: &str) -> Result<Option<User>>;
    async fn update_last_login(&self, id: UserId) -> Result<()>;
    async fn increment_failed_attempts(&self, id: UserId) -> Result<()>;
    async fn reset_failed_attempts(&self, id: UserId) -> Result<()>;
    async fn lock_account(&self, id: UserId, until: chrono::DateTime<chrono::Utc>) -> Result<()>;
}

pub struct PostgresUserRepository {
    pool: DbPool,
}

impl PostgresUserRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for PostgresUserRepository {
    async fn create(&self, user: CreateUser) -> Result<User> {
        let row = sqlx::query(
            r#"
            INSERT INTO users (username, email, password_hash, created_at, updated_at, is_active, failed_login_attempts)
            VALUES ($1, $2, $3, NOW(), NOW(), true, 0)
            RETURNING id, username, email, password_hash, created_at, updated_at, is_active, 
                     failed_login_attempts, last_login, account_locked_until
            "#
        )
        .bind(&user.username)
        .bind(&user.email)
        .bind(&user.password_hash)
        .fetch_one(&self.pool)
        .await?;

        Ok(User {
            id: UserId(row.get("id")),
            username: row.get("username"),
            email: row.get("email"),
            password_hash: row.get("password_hash"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            is_active: row.get("is_active"),
            failed_login_attempts: row.get("failed_login_attempts"),
            last_login: row.get("last_login"),
            account_locked_until: row.get("account_locked_until"),
        })
    }

    async fn find_by_id(&self, id: UserId) -> Result<Option<User>> {
        let row = sqlx::query(
            r#"
            SELECT id, username, email, password_hash, created_at, updated_at, 
                   is_active, failed_login_attempts, last_login, account_locked_until
            FROM users 
            WHERE id = $1
            "#
        )
        .bind(id.0)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(User {
                id: UserId(row.get("id")),
                username: row.get("username"),
                email: row.get("email"),
                password_hash: row.get("password_hash"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                is_active: row.get("is_active"),
                failed_login_attempts: row.get("failed_login_attempts"),
                last_login: row.get("last_login"),
                account_locked_until: row.get("account_locked_until"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn find_by_username(&self, username: &str) -> Result<Option<User>> {
        let row = sqlx::query(
            r#"
            SELECT id, username, email, password_hash, created_at, updated_at, 
                   is_active, failed_login_attempts, last_login, account_locked_until
            FROM users 
            WHERE username = $1
            "#
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(User {
                id: UserId(row.get("id")),
                username: row.get("username"),
                email: row.get("email"),
                password_hash: row.get("password_hash"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                is_active: row.get("is_active"),
                failed_login_attempts: row.get("failed_login_attempts"),
                last_login: row.get("last_login"),
                account_locked_until: row.get("account_locked_until"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>> {
        let row = sqlx::query(
            r#"
            SELECT id, username, email, password_hash, created_at, updated_at, 
                   is_active, failed_login_attempts, last_login, account_locked_until
            FROM users 
            WHERE email = $1
            "#
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(User {
                id: UserId(row.get("id")),
                username: row.get("username"),
                email: row.get("email"),
                password_hash: row.get("password_hash"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                is_active: row.get("is_active"),
                failed_login_attempts: row.get("failed_login_attempts"),
                last_login: row.get("last_login"),
                account_locked_until: row.get("account_locked_until"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn update_last_login(&self, id: UserId) -> Result<()> {
        sqlx::query("UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1")
            .bind(id.0)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn increment_failed_attempts(&self, id: UserId) -> Result<()> {
        sqlx::query("UPDATE users SET failed_login_attempts = failed_login_attempts + 1, updated_at = NOW() WHERE id = $1")
            .bind(id.0)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn reset_failed_attempts(&self, id: UserId) -> Result<()> {
        sqlx::query("UPDATE users SET failed_login_attempts = 0, updated_at = NOW() WHERE id = $1")
            .bind(id.0)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn lock_account(&self, id: UserId, until: chrono::DateTime<chrono::Utc>) -> Result<()> {
        sqlx::query("UPDATE users SET account_locked_until = $1, updated_at = NOW() WHERE id = $2")
            .bind(until)
            .bind(id.0)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}