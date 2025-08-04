use crate::domain::restaurant::{
    RestaurantId, CreateRestaurantRequest, UpdateRestaurantRequest, RestaurantQuery
};
use crate::services::restaurant_service::RestaurantService;
use crate::handlers::auth_handler::get_user_id_from_session;
use crate::error::{AppError, Result};
use actix_web::{web, HttpResponse, HttpRequest};
use actix_session::Session;
use serde_json::json;
use std::sync::Arc;

pub struct RestaurantHandler {
    restaurant_service: Arc<RestaurantService>,
}

impl RestaurantHandler {
    pub fn new(restaurant_service: Arc<RestaurantService>) -> Self {
        Self { restaurant_service }
    }

    /// Create a new restaurant
    pub async fn create(
        &self,
        req: web::Json<CreateRestaurantRequest>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let restaurant = self.restaurant_service
            .create_restaurant(req.into_inner(), user_id)
            .await?;

        Ok(HttpResponse::Created().json(restaurant))
    }

    /// Get restaurants for current user
    pub async fn get_restaurants(
        &self,
        query: web::Query<RestaurantQuery>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let restaurants = self.restaurant_service
            .get_restaurants(user_id, query.into_inner())
            .await?;

        Ok(HttpResponse::Ok().json(restaurants))
    }

    /// Get a single restaurant
    pub async fn get_restaurant(
        &self,
        path: web::Path<i32>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let restaurant_id = RestaurantId(path.into_inner());
        
        let restaurant = self.restaurant_service
            .get_restaurant(restaurant_id, user_id)
            .await?;

        Ok(HttpResponse::Ok().json(restaurant))
    }

    /// Update a restaurant
    pub async fn update(
        &self,
        path: web::Path<i32>,
        req: web::Json<UpdateRestaurantRequest>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let restaurant_id = RestaurantId(path.into_inner());
        
        let restaurant = self.restaurant_service
            .update_restaurant(restaurant_id, req.into_inner(), user_id)
            .await?;

        Ok(HttpResponse::Ok().json(restaurant))
    }

    /// Delete a restaurant
    pub async fn delete(
        &self,
        path: web::Path<i32>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let restaurant_id = RestaurantId(path.into_inner());
        
        self.restaurant_service
            .delete_restaurant(restaurant_id, user_id)
            .await?;

        Ok(HttpResponse::Ok().json(json!({"message": "Restaurant deleted successfully"})))
    }

    /// Get restaurant statistics
    pub async fn get_stats(
        &self,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let stats = self.restaurant_service.get_stats(user_id).await?;
        Ok(HttpResponse::Ok().json(stats))
    }

    /// Get favorite restaurants
    pub async fn get_favorites(
        &self,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let restaurants = self.restaurant_service.get_favorites(user_id).await?;
        Ok(HttpResponse::Ok().json(restaurants))
    }

    /// Get recent restaurants
    pub async fn get_recent(
        &self,
        query: web::Query<RestaurantQuery>,
        session: Session,
    ) -> Result<HttpResponse> {
        let user_id = get_user_id_from_session(&session)?;
        let restaurants = self.restaurant_service
            .get_recent(user_id, query.limit)
            .await?;
        Ok(HttpResponse::Ok().json(restaurants))
    }

    /// Search restaurants (placeholder for future implementation)
    pub async fn search(
        &self,
        query: web::Query<serde_json::Value>,
        session: Session,
    ) -> Result<HttpResponse> {
        let _user_id = get_user_id_from_session(&session)?;
        
        // For now, return empty search results
        // This can be expanded later with actual search functionality
        Ok(HttpResponse::Ok().json(json!({
            "results": [],
            "message": "Search functionality to be implemented"
        })))
    }
}