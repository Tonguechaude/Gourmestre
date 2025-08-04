use crate::domain::restaurant::{
    Restaurant, RestaurantId, CreateRestaurant, CreateRestaurantRequest, 
    UpdateRestaurant, UpdateRestaurantRequest, RestaurantResponse, 
    RestaurantQuery, RestaurantStatsResponse
};
use crate::domain::user::UserId;
use crate::repositories::restaurant_repository::RestaurantRepository;
use crate::error::{AppError, Result};
use std::sync::Arc;

pub struct RestaurantService {
    repo: Arc<dyn RestaurantRepository>,
}

impl RestaurantService {
    pub fn new(repo: Arc<dyn RestaurantRepository>) -> Self {
        Self { repo }
    }

    /// Create a new restaurant
    pub async fn create_restaurant(
        &self,
        request: CreateRestaurantRequest,
        owner_id: UserId,
    ) -> Result<RestaurantResponse> {
        let command = request.to_command(owner_id)?;
        let restaurant = self.repo.create(command).await?;
        Ok(RestaurantResponse::from(restaurant))
    }

    /// Get restaurants for a user
    pub async fn get_restaurants(
        &self,
        owner_id: UserId,
        query: RestaurantQuery,
    ) -> Result<Vec<RestaurantResponse>> {
        let restaurants = self.repo
            .find_by_owner(owner_id, query.favorites.unwrap_or(false), query.limit)
            .await?;

        Ok(restaurants.into_iter().map(RestaurantResponse::from).collect())
    }

    /// Get a single restaurant by ID
    pub async fn get_restaurant(
        &self,
        id: RestaurantId,
        owner_id: UserId,
    ) -> Result<RestaurantResponse> {
        let restaurant = self.repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Restaurant not found".into()))?;

        // Check ownership
        if restaurant.owner_id != owner_id {
            return Err(AppError::Authorization("Access denied".into()));
        }

        Ok(RestaurantResponse::from(restaurant))
    }

    /// Update a restaurant
    pub async fn update_restaurant(
        &self,
        id: RestaurantId,
        request: UpdateRestaurantRequest,
        owner_id: UserId,
    ) -> Result<RestaurantResponse> {
        let command = request.to_command(id, owner_id)?;
        let restaurant = self.repo
            .update(command)
            .await?
            .ok_or_else(|| AppError::NotFound("Restaurant not found or access denied".into()))?;

        Ok(RestaurantResponse::from(restaurant))
    }

    /// Delete a restaurant
    pub async fn delete_restaurant(
        &self,
        id: RestaurantId,
        owner_id: UserId,
    ) -> Result<()> {
        let deleted = self.repo.delete(id, owner_id).await?;
        if !deleted {
            return Err(AppError::NotFound("Restaurant not found or access denied".into()));
        }
        Ok(())
    }

    /// Get restaurant statistics
    pub async fn get_stats(&self, owner_id: UserId) -> Result<RestaurantStatsResponse> {
        self.repo.get_stats(owner_id).await
    }

    /// Get favorite restaurants
    pub async fn get_favorites(&self, owner_id: UserId) -> Result<Vec<RestaurantResponse>> {
        let restaurants = self.repo
            .find_by_owner(owner_id, true, None)
            .await?;

        Ok(restaurants.into_iter().map(RestaurantResponse::from).collect())
    }

    /// Get recent restaurants
    pub async fn get_recent(&self, owner_id: UserId, limit: Option<i64>) -> Result<Vec<RestaurantResponse>> {
        let restaurants = self.repo
            .find_by_owner(owner_id, false, limit)
            .await?;

        Ok(restaurants.into_iter().map(RestaurantResponse::from).collect())
    }
}