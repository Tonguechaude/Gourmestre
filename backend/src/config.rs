use crate::error::{AppError, Result};
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub server_host: String,
    pub server_port: u16,
    pub session_key: String,
    pub bcrypt_cost: u32,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        dotenvy::dotenv().ok();

        Ok(Config {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://u_gourmestre:tongue@127.0.0.1:5432/Gourmestre".to_string()),
            server_host: env::var("SERVER_HOST")
                .unwrap_or_else(|_| "127.0.0.1".to_string()),
            server_port: env::var("SERVER_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .map_err(|_| AppError::Internal("Invalid SERVER_PORT".into()))?,
            session_key: env::var("SESSION_KEY")
                .unwrap_or_else(|_| {
                    // Generate a 64-byte key for development (in production, use a proper environment variable)
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@".to_string()
                }),
            bcrypt_cost: env::var("BCRYPT_COST")
                .unwrap_or_else(|_| "12".to_string())
                .parse()
                .map_err(|_| AppError::Internal("Invalid BCRYPT_COST".into()))?,
        })
    }
}