use crate::domain::user::UserId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Unique identifier for a wishlist item
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct WishlistId(pub i32);

/// Wishlist item entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct WishlistItem {
    pub id: WishlistId,
    pub owner_id: UserId,
    pub name: String,
    pub city: String,
    pub notes: Option<String>,
    pub priority: WishlistPriority,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Priority level for wishlist items
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type, ToSchema)]
#[sqlx(type_name = "wishlist_priority", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
#[schema(example = "medium")]
pub enum WishlistPriority {
    /// Low priority - nice to try someday
    Low,
    /// Medium priority - should visit soon
    Medium,
    /// High priority - must visit as soon as possible
    High,
}

impl Default for WishlistPriority {
    fn default() -> Self {
        Self::Medium
    }
}

/// Command to create a new wishlist item
#[derive(Debug, Clone)]
pub struct CreateWishlistItem {
    pub owner_id: UserId,
    pub name: String,
    pub city: String,
    pub notes: Option<String>,
    pub priority: WishlistPriority,
}

/// Request to create a new wishlist item
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct CreateWishlistRequest {
    /// Restaurant name
    #[schema(example = "Chez L'Ami Jean")]
    pub name: String,
    /// City where the restaurant is located
    #[schema(example = "Paris")]
    pub city: String,
    /// Optional notes about why you want to visit
    #[schema(example = "Recommended by food blogger for their famous pork belly")]
    pub notes: Option<String>,
    /// Priority level (defaults to medium)
    #[serde(default)]
    #[schema(default = "medium")]
    pub priority: WishlistPriority,
}

impl CreateWishlistRequest {
    /// Convert to domain command
    pub fn to_command(self, owner_id: UserId) -> CreateWishlistItem {
        CreateWishlistItem {
            owner_id,
            name: self.name,
            city: self.city,
            notes: self.notes,
            priority: self.priority,
        }
    }
}

/// Query parameters for wishlist listing
#[derive(Debug, Clone, Default, Deserialize, ToSchema)]
pub struct WishlistQuery {
    /// Filter by priority level
    #[schema(example = "high")]
    pub priority: Option<WishlistPriority>,
    /// Maximum number of results to return
    #[schema(example = 10, minimum = 1, maximum = 100)]
    pub limit: Option<i64>,
}

/// Response for wishlist count
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct WishlistCountResponse {
    /// Total number of wishlist items
    #[schema(example = 25)]
    pub count: i64,
}

/// Response for a single wishlist item
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct WishlistItemResponse {
    /// Wishlist item ID
    #[schema(example = 1)]
    pub id: i32,
    /// Restaurant name
    #[schema(example = "Chez L'Ami Jean")]
    pub name: String,
    /// City location
    #[schema(example = "Paris")]
    pub city: String,
    /// Optional notes
    #[schema(example = "Recommended by food blogger for their famous pork belly")]
    pub notes: Option<String>,
    /// Priority level
    pub priority: WishlistPriority,
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last update timestamp
    pub updated_at: DateTime<Utc>,
}

impl From<WishlistItem> for WishlistItemResponse {
    fn from(item: WishlistItem) -> Self {
        Self {
            id: item.id.0,
            name: item.name,
            city: item.city,
            notes: item.notes,
            priority: item.priority,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }
    }
}

/// Command to update a wishlist item
#[derive(Debug, Clone)]
pub struct UpdateWishlistItem {
    pub id: WishlistId,
    pub owner_id: UserId,
    pub name: Option<String>,
    pub city: Option<String>,
    pub notes: Option<Option<String>>,
    pub priority: Option<WishlistPriority>,
}

/// Request to update a wishlist item
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct UpdateWishlistRequest {
    /// New restaurant name (optional)
    #[schema(example = "Chez L'Ami Jean - Nouvelle Adresse")]
    pub name: Option<String>,
    /// New city location (optional)
    #[schema(example = "Lyon")]
    pub city: Option<String>,
    /// New notes (None = don't update, Some(None) = clear notes, Some(Some(value)) = set notes)
    #[schema(example = "Updated notes with new recommendations")]
    pub notes: Option<Option<String>>,
    /// New priority level (optional)
    #[schema(example = "high")]
    pub priority: Option<WishlistPriority>,
}

impl UpdateWishlistRequest {
    /// Convert to domain command
    pub fn to_command(self, id: WishlistId, owner_id: UserId) -> UpdateWishlistItem {
        UpdateWishlistItem {
            id,
            owner_id,
            name: self.name,
            city: self.city,
            notes: self.notes,
            priority: self.priority,
        }
    }
}