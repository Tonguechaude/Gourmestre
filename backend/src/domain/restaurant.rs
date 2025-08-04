use crate::domain::user::UserId;
use crate::error::{AppError, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// Unique identifier for a restaurant
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct RestaurantId(pub i32);

/// Restaurant entity
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Restaurant {
    pub id: RestaurantId,
    pub owner_id: UserId,
    pub name: String,
    pub city: String,
    pub rating: Option<i16>,
    pub description: Option<String>,
    pub is_favorite: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Validated rating (1-5)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Rating(i16);

impl Rating {
    /// Create a new rating with validation
    pub fn new(value: i16) -> Result<Self> {
        if !(1..=5).contains(&value) {
            return Err(AppError::Validation(
                "Rating must be between 1 and 5".into(),
            ));
        }
        Ok(Self(value))
    }

    /// Get the inner value
    pub fn value(&self) -> i16 {
        self.0
    }
}

/// Command to create a new restaurant
#[derive(Debug, Clone)]
pub struct CreateRestaurant {
    pub owner_id: UserId,
    pub name: String,
    pub city: String,
    pub rating: Option<i16>,
    pub description: Option<String>,
    pub is_favorite: bool,
}

/// Request to create a new restaurant
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct CreateRestaurantRequest {
    /// Restaurant name
    #[schema(example = "Le Comptoir du Relais")]
    pub name: String,
    /// City where the restaurant is located
    #[schema(example = "Paris")]
    pub city: String,
    /// Rating from 1 to 5 stars (optional)
    #[schema(example = 4, minimum = 1, maximum = 5)]
    pub rating: Option<i16>,
    /// Optional description or notes
    #[schema(example = "Great bistro with traditional French cuisine")]
    pub description: Option<String>,
    /// Whether this restaurant is marked as favorite
    #[serde(default)]
    #[schema(default = false)]
    pub is_favorite: bool,
}

impl CreateRestaurantRequest {
    /// Convert to domain command
    pub fn to_command(self, owner_id: UserId) -> Result<CreateRestaurant> {
        // Validate rating if provided
        if let Some(rating) = self.rating {
            Rating::new(rating)?;
        }

        Ok(CreateRestaurant {
            owner_id,
            name: self.name,
            city: self.city,
            rating: self.rating,
            description: self.description,
            is_favorite: self.is_favorite,
        })
    }
}

/// Query parameters for restaurant listing
#[derive(Debug, Clone, Default, Deserialize, ToSchema)]
pub struct RestaurantQuery {
    /// Filter by favorite restaurants only
    #[serde(default)]
    #[schema(example = true)]
    pub favorites: Option<bool>,
    /// Maximum number of results to return
    #[schema(example = 10, minimum = 1, maximum = 100)]
    pub limit: Option<i64>,
}

/// Response for restaurant statistics
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct RestaurantStatsResponse {
    /// Total number of restaurants
    #[schema(example = 42)]
    pub total_restaurants: i64,
    /// Number of favorite restaurants
    #[schema(example = 15)]
    pub total_favorites: i64,
    /// Average rating across all restaurants
    #[schema(example = "4.2")]
    pub average_rating: String,
}

/// Response for a single restaurant
#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct RestaurantResponse {
    /// Restaurant ID
    #[schema(example = 1)]
    pub id: i32,
    /// Restaurant name
    #[schema(example = "Le Comptoir du Relais")]
    pub name: String,
    /// City location
    #[schema(example = "Paris")]
    pub city: String,
    /// Rating (1-5 stars, 0 if no rating)
    #[schema(example = 4, minimum = 0, maximum = 5)]
    pub rating: i16,
    /// Optional description or notes
    #[schema(example = "Great bistro with traditional French cuisine")]
    pub description: Option<String>,
    /// Whether marked as favorite
    #[schema(example = true)]
    pub is_favorite: bool,
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last update timestamp
    pub updated_at: DateTime<Utc>,
}

impl From<Restaurant> for RestaurantResponse {
    fn from(restaurant: Restaurant) -> Self {
        Self {
            id: restaurant.id.0,
            name: restaurant.name,
            city: restaurant.city,
            rating: restaurant.rating.unwrap_or(0),
            description: restaurant.description,
            is_favorite: restaurant.is_favorite,
            created_at: restaurant.created_at,
            updated_at: restaurant.updated_at,
        }
    }
}

/// Command to update a restaurant
#[derive(Debug, Clone)]
pub struct UpdateRestaurant {
    pub id: RestaurantId,
    pub owner_id: UserId,
    pub name: Option<String>,
    pub city: Option<String>,
    pub rating: Option<Option<i16>>, // None means don't update, Some(None) means clear rating
    pub description: Option<Option<String>>,
    pub is_favorite: Option<bool>,
}

/// Request to update a restaurant
#[derive(Debug, Clone, Deserialize, ToSchema)]
pub struct UpdateRestaurantRequest {
    /// New restaurant name (optional)
    #[schema(example = "Le Comptoir du Relais - Nouvelle Adresse")]
    pub name: Option<String>,
    /// New city location (optional)
    #[schema(example = "Lyon")]
    pub city: Option<String>,
    /// New rating (None = don't update, Some(None) = clear rating, Some(Some(value)) = set rating)
    #[schema(example = 5, minimum = 1, maximum = 5)]
    pub rating: Option<Option<i16>>,
    /// New description (None = don't update, Some(None) = clear description, Some(Some(value)) = set description)
    #[schema(example = "Updated description with new specialties")]
    pub description: Option<Option<String>>,
    /// New favorite status (optional)
    #[schema(example = false)]
    pub is_favorite: Option<bool>,
}

impl UpdateRestaurantRequest {
    /// Convert to domain command
    pub fn to_command(self, id: RestaurantId, owner_id: UserId) -> Result<UpdateRestaurant> {
        // Validate rating if provided
        if let Some(Some(rating)) = self.rating {
            Rating::new(rating)?;
        }

        Ok(UpdateRestaurant {
            id,
            owner_id,
            name: self.name,
            city: self.city,
            rating: self.rating,
            description: self.description,
            is_favorite: self.is_favorite,
        })
    }
}