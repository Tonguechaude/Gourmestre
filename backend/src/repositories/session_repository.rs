use crate::domain::session::{Session, CreateSession};
use crate::domain::user::UserId;
use crate::error::Result;
use crate::database::DbPool;
use async_trait::async_trait;
use uuid::Uuid;
use sqlx::Row;

#[async_trait]
pub trait SessionRepository: Send + Sync {
    async fn create(&self, session: CreateSession) -> Result<Session>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Session>>;
    async fn find_active_by_user(&self, user_id: UserId) -> Result<Vec<Session>>;
    async fn deactivate(&self, id: Uuid) -> Result<bool>;
    async fn deactivate_all_for_user(&self, user_id: UserId) -> Result<u64>;
    async fn cleanup_expired(&self) -> Result<u64>;
}

pub struct PostgresSessionRepository {
    pool: DbPool,
}

impl PostgresSessionRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl SessionRepository for PostgresSessionRepository {
    async fn create(&self, session: CreateSession) -> Result<Session> {
        let id = Uuid::new_v4();
        
        let row = sqlx::query(
            r#"
            INSERT INTO sessions (id, user_id, ip_address, user_agent, created_at, expires_at, is_active)
            VALUES ($1, $2, $3, $4, NOW(), $5, true)
            RETURNING id, user_id, ip_address, user_agent, created_at, expires_at, is_active
            "#
        )
        .bind(id)
        .bind(session.user_id.0)
        .bind(&session.ip_address)
        .bind(&session.user_agent)
        .bind(session.expires_at)
        .fetch_one(&self.pool)
        .await?;

        Ok(Session {
            id: row.get("id"),
            user_id: UserId(row.get("user_id")),
            ip_address: row.get("ip_address"),
            user_agent: row.get("user_agent"),
            created_at: row.get("created_at"),
            expires_at: row.get("expires_at"),
            is_active: row.get("is_active"),
        })
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Session>> {
        let row = sqlx::query(
            r#"
            SELECT id, user_id, ip_address, user_agent, created_at, expires_at, is_active
            FROM sessions 
            WHERE id = $1 AND is_active = true AND expires_at > NOW()
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(Session {
                id: row.get("id"),
                user_id: UserId(row.get("user_id")),
                ip_address: row.get("ip_address"),
                user_agent: row.get("user_agent"),
                created_at: row.get("created_at"),
                expires_at: row.get("expires_at"),
                is_active: row.get("is_active"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn find_active_by_user(&self, user_id: UserId) -> Result<Vec<Session>> {
        let rows = sqlx::query(
            r#"
            SELECT id, user_id, ip_address, user_agent, created_at, expires_at, is_active
            FROM sessions 
            WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
            ORDER BY created_at DESC
            "#
        )
        .bind(user_id.0)
        .fetch_all(&self.pool)
        .await?;

        let sessions = rows.into_iter().map(|row| {
            Session {
                id: row.get("id"),
                user_id: UserId(row.get("user_id")),
                ip_address: row.get("ip_address"),
                user_agent: row.get("user_agent"),
                created_at: row.get("created_at"),
                expires_at: row.get("expires_at"),
                is_active: row.get("is_active"),
            }
        }).collect();

        Ok(sessions)
    }

    async fn deactivate(&self, id: Uuid) -> Result<bool> {
        let result = sqlx::query("UPDATE sessions SET is_active = false WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    async fn deactivate_all_for_user(&self, user_id: UserId) -> Result<u64> {
        let result = sqlx::query("UPDATE sessions SET is_active = false WHERE user_id = $1")
            .bind(user_id.0)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected())
    }

    async fn cleanup_expired(&self) -> Result<u64> {
        let result = sqlx::query("DELETE FROM sessions WHERE expires_at < NOW() OR is_active = false")
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected())
    }
}