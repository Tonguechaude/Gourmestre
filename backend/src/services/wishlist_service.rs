use crate::domain::wishlist::{
    WishlistItem, WishlistId, CreateWishlistItem, CreateWishlistRequest,
    UpdateWishlistItem, UpdateWishlistRequest, WishlistItemResponse,
    WishlistQuery, WishlistCountResponse, WishlistPriority
};
use crate::domain::user::UserId;
use crate::repositories::wishlist_repository::WishlistRepository;
use crate::error::{AppError, Result};
use std::sync::Arc;

pub struct WishlistService {
    repo: Arc<dyn WishlistRepository>,
}

impl WishlistService {
    pub fn new(repo: Arc<dyn WishlistRepository>) -> Self {
        Self { repo }
    }

    /// Create a new wishlist item
    pub async fn create_item(
        &self,
        request: CreateWishlistRequest,
        owner_id: UserId,
    ) -> Result<WishlistItemResponse> {
        let command = request.to_command(owner_id);
        let item = self.repo.create(command).await?;
        Ok(WishlistItemResponse::from(item))
    }

    /// Get wishlist items for a user
    pub async fn get_items(
        &self,
        owner_id: UserId,
        query: WishlistQuery,
    ) -> Result<Vec<WishlistItemResponse>> {
        let items = self.repo
            .find_by_owner(owner_id, query.priority, query.limit)
            .await?;

        Ok(items.into_iter().map(WishlistItemResponse::from).collect())
    }

    /// Get a single wishlist item by ID
    pub async fn get_item(
        &self,
        id: WishlistId,
        owner_id: UserId,
    ) -> Result<WishlistItemResponse> {
        let item = self.repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| AppError::NotFound("Wishlist item not found".into()))?;

        // Check ownership
        if item.owner_id != owner_id {
            return Err(AppError::Authorization("Access denied".into()));
        }

        Ok(WishlistItemResponse::from(item))
    }

    /// Update a wishlist item
    pub async fn update_item(
        &self,
        id: WishlistId,
        request: UpdateWishlistRequest,
        owner_id: UserId,
    ) -> Result<WishlistItemResponse> {
        let command = request.to_command(id, owner_id);
        let item = self.repo
            .update(command)
            .await?
            .ok_or_else(|| AppError::NotFound("Wishlist item not found or access denied".into()))?;

        Ok(WishlistItemResponse::from(item))
    }

    /// Delete a wishlist item
    pub async fn delete_item(
        &self,
        id: WishlistId,
        owner_id: UserId,
    ) -> Result<()> {
        let deleted = self.repo.delete(id, owner_id).await?;
        if !deleted {
            return Err(AppError::NotFound("Wishlist item not found or access denied".into()));
        }
        Ok(())
    }

    /// Get wishlist count
    pub async fn get_count(&self, owner_id: UserId) -> Result<WishlistCountResponse> {
        self.repo.get_count(owner_id).await
    }

    /// Promote wishlist item to restaurant
    pub async fn promote_to_restaurant(
        &self,
        id: WishlistId,
        owner_id: UserId,
    ) -> Result<()> {
        let promoted = self.repo.promote_to_restaurant(id, owner_id).await?;
        if !promoted {
            return Err(AppError::NotFound("Wishlist item not found or access denied".into()));
        }
        Ok(())
    }

    /// Get items by priority
    pub async fn get_by_priority(
        &self,
        owner_id: UserId,
        priority: WishlistPriority,
    ) -> Result<Vec<WishlistItemResponse>> {
        let items = self.repo
            .find_by_owner(owner_id, Some(priority), None)
            .await?;

        Ok(items.into_iter().map(WishlistItemResponse::from).collect())
    }
}