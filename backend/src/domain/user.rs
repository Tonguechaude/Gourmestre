use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Unique identifier for a user
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct UserId(pub i32);

/// User entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: UserId,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub is_active: bool,
    pub failed_login_attempts: i32,
    pub last_login: Option<DateTime<Utc>>,
    pub account_locked_until: Option<DateTime<Utc>>,
}

/// Validated username
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Username(String);

impl Username {
    /// Create a new username with validation
    pub fn new(value: String) -> Result<Self> {
        if value.len() < 3 || value.len() > 50 {
            return Err(AppError::Validation(
                "Username must be between 3 and 50 characters".into(),
            ));
        }

        if !value
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
        {
            return Err(AppError::Validation(
                "Username can only contain letters, numbers, underscore and dash".into(),
            ));
        }

        Ok(Self(value))
    }

    /// Get the inner string value
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Convert to owned String
    pub fn into_string(self) -> String {
        self.0
    }
}

/// Validated email address
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Email(String);

impl Email {
    /// Create a new email with basic validation
    pub fn new(value: String) -> Result<Self> {
        if value.len() > 254 {
            return Err(AppError::Validation("Email is too long".into()));
        }

        // Basic email validation - in production, use a proper email validation library
        if !value.contains('@') {
            return Err(AppError::Validation("Invalid email format".into()));
        }

        Ok(Self(value))
    }

    /// Get the inner string value
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Convert to owned String
    pub fn into_string(self) -> String {
        self.0
    }
}

/// Password with validation
#[derive(Debug, Clone)]
pub struct Password(String);

impl Password {
    /// Create a new password with validation
    pub fn new(value: String) -> Result<Self> {
        if value.len() < 4 {
            return Err(AppError::Validation(
                "Password must be at least 4 characters long".into(),
            ));
        }

        Ok(Self(value))
    }

    /// Get the inner string value
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

/// Hashed password
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordHash(String);

impl PasswordHash {
    /// Create from a hash string (assumes it's already hashed)
    pub fn from_hash(hash: String) -> Self {
        Self(hash)
    }

    /// Get the hash string
    pub fn as_str(&self) -> &str {
        &self.0
    }

    /// Convert to owned String
    pub fn into_string(self) -> String {
        self.0
    }
}

/// Command to create a new user
#[derive(Debug, Clone)]
pub struct CreateUser {
    pub username: String,
    pub email: String,
    pub password_hash: String,
}

/// Command to register a new user
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct RegisterUserCommand {
    /// Username (3-50 characters, alphanumeric + underscore/dash)
    #[schema(example = "john_doe")]
    pub username: String,
    /// Password (minimum 8 characters)
    #[schema(example = "secretpassword123", min_length = 8)]
    pub password: String,
}

/// Command to login a user
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct LoginCommand {
    /// Username
    #[schema(example = "john_doe")]
    pub username: String,
    /// Password
    #[schema(example = "secretpassword123")]
    pub password: String,
}

/// Response for user registration
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct RegisterResponse {
    /// User ID
    #[schema(example = 1)]
    pub id: i32,
    /// Username
    #[schema(example = "john_doe")]
    pub username: String,
    /// Success message
    #[schema(example = "User registered successfully")]
    pub message: String,
}

/// Response for user info
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct UserInfoResponse {
    /// User ID
    #[schema(example = 1)]
    pub id: i32,
    /// Username
    #[schema(example = "john_doe")]
    pub username: String,
    /// Email address
    #[schema(example = "john@example.com")]
    pub email: String,
    /// Account creation timestamp
    pub created_at: DateTime<Utc>,
}

/// Alias for UserInfoResponse to match API docs
pub type UserResponse = UserInfoResponse;

impl From<&User> for UserInfoResponse {
    fn from(user: &User) -> Self {
        Self {
            id: user.id.0,
            username: user.username.clone(),
            email: user.email.clone(),
            created_at: user.created_at,
        }
    }
}