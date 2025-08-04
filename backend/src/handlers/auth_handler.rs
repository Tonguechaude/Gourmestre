use crate::domain::user::{RegisterUserCommand, LoginCommand, UserInfoResponse, UserId};
use crate::domain::session::SessionData;
use crate::services::auth_service::AuthService;
use crate::error::{AppError, Result};
use actix_web::{web, HttpResponse, HttpRequest};
use actix_session::Session;
use serde_json::json;
use std::sync::Arc;

pub struct AuthHandler {
    auth_service: Arc<AuthService>,
}

impl AuthHandler {
    pub fn new(auth_service: Arc<AuthService>) -> Self {
        Self { auth_service }
    }

    /// Register a new user
    pub async fn register(
        &self,
        req: web::Json<RegisterUserCommand>,
    ) -> Result<HttpResponse> {
        let response = self.auth_service.register(req.into_inner()).await?;
        Ok(HttpResponse::Created().json(response))
    }

    /// Login user
    pub async fn login(
        &self,
        req: web::Json<LoginCommand>,
        session: Session,
    ) -> Result<HttpResponse> {
        let (session_data, _user) = self.auth_service.login(req.into_inner()).await?;
        
        // Store session data
        session.insert("user_data", &session_data)
            .map_err(|_| AppError::Internal("Failed to create session".into()))?;

        Ok(HttpResponse::Ok().json(json!({
            "message": "Login successful",
            "user": {
                "id": session_data.user_id,
                "username": session_data.username
            }
        })))
    }

    /// Logout user
    pub async fn logout(
        &self,
        session: Session,
    ) -> Result<HttpResponse> {
        if let Ok(Some(session_data)) = session.get::<SessionData>("user_data") {
            let user_id = UserId(session_data.user_id);
            self.auth_service.logout(user_id).await?;
        }

        session.purge();
        Ok(HttpResponse::Ok().json(json!({"message": "Logout successful"})))
    }

    /// Get current user info
    pub async fn get_user_info(
        &self,
        session: Session,
    ) -> Result<HttpResponse> {
        let session_data = session.get::<SessionData>("user_data")
            .map_err(|_| AppError::Authentication("Invalid session".into()))?
            .ok_or_else(|| AppError::Authentication("Not authenticated".into()))?;

        let user_id = UserId(session_data.user_id);
        let user_info = self.auth_service.get_user_info(user_id).await?;

        Ok(HttpResponse::Ok().json(user_info))
    }

    /// Check authentication status
    pub async fn check_auth(
        &self,
        session: Session,
    ) -> Result<HttpResponse> {
        let session_data = session.get::<SessionData>("user_data")
            .map_err(|_| AppError::Authentication("Invalid session".into()))?;

        match session_data {
            Some(data) => Ok(HttpResponse::Ok().json(json!({
                "authenticated": true,
                "user": {
                    "id": data.user_id,
                    "username": data.username
                }
            }))),
            None => Ok(HttpResponse::Ok().json(json!({
                "authenticated": false
            })))
        }
    }
}

// Helper function to extract user ID from session
pub fn get_user_id_from_session(session: &Session) -> Result<UserId> {
    let session_data = session.get::<SessionData>("user_data")
        .map_err(|_| AppError::Authentication("Invalid session".into()))?
        .ok_or_else(|| AppError::Authentication("Not authenticated".into()))?;

    Ok(UserId(session_data.user_id))
}