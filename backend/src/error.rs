use actix_web::{HttpResponse, ResponseError};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use utoipa::ToSchema;

pub type Result<T> = std::result::Result<T, AppError>;

#[derive(Error, Debug, Serialize, Deserialize, ToSchema)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    /// Database operation failed
    #[error("Database error: {0}")]
    Database(String),

    /// Database migration failed
    #[error("Database migration error: {0}")]
    Migration(String),

    /// Input validation failed
    #[error("Validation error: {0}")]
    #[schema(example = "Username must be between 3 and 50 characters")]
    Validation(String),

    /// Authentication failed
    #[error("Authentication error: {0}")]
    #[schema(example = "Invalid credentials")]
    Authentication(String),

    /// Authorization failed (insufficient permissions)
    #[error("Authorization error: {0}")]
    #[schema(example = "Access denied")]
    Authorization(String),

    /// Resource not found
    #[error("Not found: {0}")]
    #[schema(example = "Restaurant not found")]
    NotFound(String),

    /// Resource conflict (duplicate, etc.)
    #[error("Conflict: {0}")]
    #[schema(example = "Username already exists")]
    Conflict(String),

    /// Internal server error
    #[error("Internal server error: {0}")]
    #[schema(example = "An unexpected error occurred")]
    Internal(String),

    /// Bad request format
    #[error("Bad request: {0}")]
    #[schema(example = "Invalid JSON format")]
    BadRequest(String),

    /// Password hashing error
    #[error("Bcrypt error: {0}")]
    Bcrypt(String),

    /// JSON parsing error
    #[error("JSON error: {0}")]
    Json(String),

    /// Environment configuration error
    #[error("Environment variable error: {0}")]
    Env(String),
}

// Conversion implementations for external error types
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::Database(err.to_string())
    }
}

impl From<sqlx::migrate::MigrateError> for AppError {
    fn from(err: sqlx::migrate::MigrateError) -> Self {
        AppError::Migration(err.to_string())
    }
}

impl From<bcrypt::BcryptError> for AppError {
    fn from(err: bcrypt::BcryptError) -> Self {
        AppError::Bcrypt(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Json(err.to_string())
    }
}

impl From<std::env::VarError> for AppError {
    fn from(err: std::env::VarError) -> Self {
        AppError::Env(err.to_string())
    }
}

impl ResponseError for AppError {
    fn status_code(&self) -> actix_web::http::StatusCode {
        use actix_web::http::StatusCode;
        match self {
            AppError::Database(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::Migration(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::Validation(_) => StatusCode::BAD_REQUEST,
            AppError::Authentication(_) => StatusCode::UNAUTHORIZED,
            AppError::Authorization(_) => StatusCode::FORBIDDEN,
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::Conflict(_) => StatusCode::CONFLICT,
            AppError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::Bcrypt(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::Json(_) => StatusCode::BAD_REQUEST,
            AppError::Env(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(serde_json::json!({
            "error": self.to_string(),
            "status": self.status_code().as_u16()
        }))
    }
}