use crate::config::Config;
use crate::error::{AppError, Result};
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use sqlx::{Pool, Postgres};
use std::str::FromStr;

pub type DbPool = Pool<Postgres>;

pub async fn create_pool(config: &Config) -> Result<DbPool> {
    let connect_options = PgConnectOptions::from_str(&config.database_url)?;
    
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .connect_with(connect_options)
        .await?;

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;

    Ok(pool)
}