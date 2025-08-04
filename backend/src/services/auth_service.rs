use crate::domain::user::{User, UserId, CreateUser, RegisterUserCommand, LoginCommand, RegisterResponse, UserInfoResponse};
use crate::domain::session::{CreateSession, SessionData};
use crate::repositories::user_repository::UserRepository;
use crate::repositories::session_repository::SessionRepository;
use crate::error::{AppError, Result};
use crate::config::Config;
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{DateTime, Utc, Duration};
use std::sync::Arc;

pub struct AuthService {
    user_repo: Arc<dyn UserRepository>,
    session_repo: Arc<dyn SessionRepository>,
    config: Config,
}

impl AuthService {
    pub fn new(
        user_repo: Arc<dyn UserRepository>,
        session_repo: Arc<dyn SessionRepository>,
        config: Config,
    ) -> Self {
        Self {
            user_repo,
            session_repo,
            config,
        }
    }

    /// Register a new user
    pub async fn register(&self, command: RegisterUserCommand) -> Result<RegisterResponse> {
        // Check if username already exists
        if let Some(_) = self.user_repo.find_by_username(&command.username).await? {
            return Err(AppError::Conflict("Username already exists".into()));
        }

        // Validate and hash password
        if command.password.len() < 4 {
            return Err(AppError::Validation("Password must be at least 4 characters long".into()));
        }

        let password_hash = hash(&command.password, self.config.bcrypt_cost)
            .map_err(|_| AppError::Internal("Failed to hash password".into()))?;

        // Create user
        let create_user = CreateUser {
            username: command.username.clone(),
            email: format!("{}@example.com", command.username), // Simplified for now
            password_hash,
        };

        let user = self.user_repo.create(create_user).await?;

        Ok(RegisterResponse {
            id: user.id.0,
            username: user.username,
            message: "User registered successfully".into(),
        })
    }

    /// Login a user
    pub async fn login(&self, command: LoginCommand) -> Result<(SessionData, User)> {
        // Find user by username
        let user = self.user_repo
            .find_by_username(&command.username)
            .await?
            .ok_or_else(|| AppError::Authentication("Invalid credentials".into()))?;

        // Check if account is locked
        if let Some(locked_until) = user.account_locked_until {
            if locked_until > Utc::now() {
                return Err(AppError::Authentication("Account is temporarily locked".into()));
            }
        }

        // Verify password
        let password_valid = verify(&command.password, &user.password_hash)
            .map_err(|_| AppError::Internal("Password verification failed".into()))?;

        if !password_valid {
            // Increment failed login attempts
            self.user_repo.increment_failed_attempts(user.id).await?;
            
            // Lock account after 5 failed attempts
            if user.failed_login_attempts >= 4 {
                let lock_until = Utc::now() + Duration::minutes(15);
                self.user_repo.lock_account(user.id, lock_until).await?;
            }
            
            return Err(AppError::Authentication("Invalid credentials".into()));
        }

        // Reset failed attempts and update last login
        self.user_repo.reset_failed_attempts(user.id).await?;
        self.user_repo.update_last_login(user.id).await?;

        // Create session
        let session_data = SessionData {
            user_id: user.id.0,
            username: user.username.clone(),
        };

        Ok((session_data, user))
    }

    /// Get user info
    pub async fn get_user_info(&self, user_id: UserId) -> Result<UserInfoResponse> {
        let user = self.user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        Ok(UserInfoResponse::from(&user))
    }

    /// Logout user (deactivate session)
    pub async fn logout(&self, user_id: UserId) -> Result<()> {
        self.session_repo.deactivate_all_for_user(user_id).await?;
        Ok(())
    }

    /// Validate session and get user
    pub async fn validate_session(&self, user_id: UserId) -> Result<User> {
        self.user_repo
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::Authentication("Invalid session".into()))
    }
}