use crate::domain::user::{User, UserId, UserInfoResponse};
use crate::repositories::user_repository::UserRepository;
use crate::error::{AppError, Result};
use std::sync::Arc;

pub struct UserService {
    repo: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }

    /// Get user by ID
    pub async fn get_user(&self, id: UserId) -> Result<UserInfoResponse> {
        let user = self.repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        Ok(UserInfoResponse::from(&user))
    }

    /// Get user by username
    pub async fn get_user_by_username(&self, username: &str) -> Result<UserInfoResponse> {
        let user = self.repo
            .find_by_username(username)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        Ok(UserInfoResponse::from(&user))
    }

    /// Check if user exists by username
    pub async fn user_exists(&self, username: &str) -> Result<bool> {
        let user = self.repo.find_by_username(username).await?;
        Ok(user.is_some())
    }

    /// Check if email exists
    pub async fn email_exists(&self, email: &str) -> Result<bool> {
        let user = self.repo.find_by_email(email).await?;
        Ok(user.is_some())
    }
}