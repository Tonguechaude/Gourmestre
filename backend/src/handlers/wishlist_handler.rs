use crate::domain::wishlist::{
    WishlistId, CreateWishlistRequest, UpdateWishlistRequest, WishlistQuery, WishlistPriority
};
use crate::services::wishlist_service::WishlistService;
use crate::handlers::auth_handler::get_user_id_from_session;
use crate::error::{AppError, Result};
use actix_web::{web, HttpResponse, HttpRequest};
use actix_session::Session;
use serde_json::json;
use std::sync::Arc;

pub struct WishlistHandler {
    wishlist_service: Arc<WishlistService>,
}

impl WishlistHandler {
    pub fn new(wishlist_service: Arc<WishlistService>) -> Self {
        Self { wishlist_service }
    }

    /// Create a new wishlist item
    pub async fn create(
        &self,
        req: web::Json<CreateWishlistRequest>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let item = self.wishlist_service
            .create_item(req.into_inner(), user_id)
            .await?;

        Ok(HttpResponse::Created().json(item))
    }

    /// Get wishlist items for current user
    pub async fn get_items(
        &self,
        query: web::Query<WishlistQuery>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let items = self.wishlist_service
            .get_items(user_id, query.into_inner())
            .await?;

        Ok(HttpResponse::Ok().json(items))
    }

    /// Get a single wishlist item
    pub async fn get_item(
        &self,
        path: web::Path<i32>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let item_id = WishlistId(path.into_inner());
        
        let item = self.wishlist_service
            .get_item(item_id, user_id)
            .await?;

        Ok(HttpResponse::Ok().json(item))
    }

    /// Update a wishlist item
    pub async fn update(
        &self,
        path: web::Path<i32>,
        req: web::Json<UpdateWishlistRequest>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let item_id = WishlistId(path.into_inner());
        
        let item = self.wishlist_service
            .update_item(item_id, req.into_inner(), user_id)
            .await?;

        Ok(HttpResponse::Ok().json(item))
    }

    /// Delete a wishlist item
    pub async fn delete(
        &self,
        path: web::Path<i32>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let item_id = WishlistId(path.into_inner());
        
        self.wishlist_service
            .delete_item(item_id, user_id)
            .await?;

        Ok(HttpResponse::Ok().json(json!({"message": "Wishlist item deleted successfully"})))
    }

    /// Get wishlist count
    pub async fn get_count(
        &self,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let count = self.wishlist_service.get_count(user_id).await?;
        Ok(HttpResponse::Ok().json(count))
    }

    /// Promote wishlist item to restaurant
    pub async fn promote(
        &self,
        path: web::Path<i32>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let item_id = WishlistId(path.into_inner());
        
        self.wishlist_service
            .promote_to_restaurant(item_id, user_id)
            .await?;

        Ok(HttpResponse::Ok().json(json!({
            "message": "Wishlist item promoted to restaurant successfully"
        })))
    }

    /// Get items by priority
    pub async fn get_by_priority(
        &self,
        path: web::Path<String>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let priority_str = path.into_inner();
        
        let priority = match priority_str.as_str() {
            "high" => WishlistPriority::High,
            "medium" => WishlistPriority::Medium,
            "low" => WishlistPriority::Low,
            _ => return Err(AppError::BadRequest("Invalid priority".into())),
        };
        
        let items = self.wishlist_service
            .get_by_priority(user_id, priority)
            .await?;

        Ok(HttpResponse::Ok().json(items))
    }
}