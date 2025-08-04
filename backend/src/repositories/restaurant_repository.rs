use crate::domain::restaurant::{Restaurant, RestaurantId, CreateRestaurant, UpdateRestaurant, RestaurantStatsResponse};
use crate::domain::user::UserId;
use crate::error::Result;
use crate::database::DbPool;
use async_trait::async_trait;
use bigdecimal::BigDecimal;
use sqlx::Row;

#[async_trait]
pub trait RestaurantRepository: Send + Sync {
    async fn create(&self, restaurant: CreateRestaurant) -> Result<Restaurant>;
    async fn find_by_id(&self, id: RestaurantId) -> Result<Option<Restaurant>>;
    async fn find_by_owner(&self, owner_id: UserId, favorites_only: bool, limit: Option<i64>) -> Result<Vec<Restaurant>>;
    async fn update(&self, restaurant: UpdateRestaurant) -> Result<Option<Restaurant>>;
    async fn delete(&self, id: RestaurantId, owner_id: UserId) -> Result<bool>;
    async fn get_stats(&self, owner_id: UserId) -> Result<RestaurantStatsResponse>;
}

pub struct PostgresRestaurantRepository {
    pool: DbPool,
}

impl PostgresRestaurantRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl RestaurantRepository for PostgresRestaurantRepository {
    async fn create(&self, restaurant: CreateRestaurant) -> Result<Restaurant> {
        let row = sqlx::query(
            r#"
            INSERT INTO restaurants (owner_id, name, city, rating, description, is_favorite, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING id, owner_id, name, city, rating, description, is_favorite, created_at, updated_at
            "#
        )
        .bind(restaurant.owner_id.0)
        .bind(&restaurant.name)
        .bind(&restaurant.city)
        .bind(restaurant.rating)
        .bind(&restaurant.description)
        .bind(restaurant.is_favorite)
        .fetch_one(&self.pool)
        .await?;

        Ok(Restaurant {
            id: RestaurantId(row.get("id")),
            owner_id: UserId(row.get("owner_id")),
            name: row.get("name"),
            city: row.get("city"),
            rating: row.get("rating"),
            description: row.get("description"),
            is_favorite: row.get("is_favorite"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    async fn find_by_id(&self, id: RestaurantId) -> Result<Option<Restaurant>> {
        let row = sqlx::query(
            r#"
            SELECT id, owner_id, name, city, rating, description, is_favorite, created_at, updated_at
            FROM restaurants 
            WHERE id = $1
            "#
        )
        .bind(id.0)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(Restaurant {
                id: RestaurantId(row.get("id")),
                owner_id: UserId(row.get("owner_id")),
                name: row.get("name"),
                city: row.get("city"),
                rating: row.get("rating"),
                description: row.get("description"),
                is_favorite: row.get("is_favorite"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn find_by_owner(&self, owner_id: UserId, favorites_only: bool, limit: Option<i64>) -> Result<Vec<Restaurant>> {
        let mut query = String::from(
            r#"
            SELECT id, owner_id, name, city, rating, description, is_favorite, created_at, updated_at
            FROM restaurants 
            WHERE owner_id = $1
            "#
        );

        if favorites_only {
            query.push_str(" AND is_favorite = true");
        }

        query.push_str(" ORDER BY created_at DESC");

        if let Some(limit) = limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        let rows = sqlx::query(&query)
            .bind(owner_id.0)
            .fetch_all(&self.pool)
            .await?;

        let restaurants = rows.into_iter().map(|row| {
            Restaurant {
                id: RestaurantId(row.get("id")),
                owner_id: UserId(row.get("owner_id")),
                name: row.get("name"),
                city: row.get("city"),
                rating: row.get("rating"),
                description: row.get("description"),
                is_favorite: row.get("is_favorite"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }
        }).collect();

        Ok(restaurants)
    }

    async fn update(&self, restaurant: UpdateRestaurant) -> Result<Option<Restaurant>> {
        // Build dynamic update query
        let mut query_parts = Vec::new();
        let mut param_count = 1;

        if let Some(name) = &restaurant.name {
            query_parts.push(format!("name = ${}", param_count));
            param_count += 1;
        }

        if let Some(city) = &restaurant.city {
            query_parts.push(format!("city = ${}", param_count));
            param_count += 1;
        }

        if let Some(rating) = &restaurant.rating {
            query_parts.push(format!("rating = ${}", param_count));
            param_count += 1;
        }

        if let Some(description) = &restaurant.description {
            query_parts.push(format!("description = ${}", param_count));
            param_count += 1;
        }

        if let Some(is_favorite) = restaurant.is_favorite {
            query_parts.push(format!("is_favorite = ${}", param_count));
            param_count += 1;
        }

        if query_parts.is_empty() {
            // No updates requested, just return the current restaurant
            return self.find_by_id(restaurant.id).await;
        }

        query_parts.push("updated_at = NOW()".to_string());

        let query = format!(
            r#"
            UPDATE restaurants 
            SET {}
            WHERE id = ${} AND owner_id = ${}
            RETURNING id, owner_id, name, city, rating, description, is_favorite, created_at, updated_at
            "#,
            query_parts.join(", "),
            param_count,
            param_count + 1
        );

        let mut sqlx_query = sqlx::query(&query);

        if let Some(name) = &restaurant.name {
            sqlx_query = sqlx_query.bind(name);
        }
        if let Some(city) = &restaurant.city {
            sqlx_query = sqlx_query.bind(city);
        }
        if let Some(rating) = &restaurant.rating {
            sqlx_query = sqlx_query.bind(rating);
        }
        if let Some(description) = &restaurant.description {
            sqlx_query = sqlx_query.bind(description);
        }
        if let Some(is_favorite) = restaurant.is_favorite {
            sqlx_query = sqlx_query.bind(is_favorite);
        }

        sqlx_query = sqlx_query.bind(restaurant.id.0).bind(restaurant.owner_id.0);

        let row = sqlx_query
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            Ok(Some(Restaurant {
                id: RestaurantId(row.get("id")),
                owner_id: UserId(row.get("owner_id")),
                name: row.get("name"),
                city: row.get("city"),
                rating: row.get("rating"),
                description: row.get("description"),
                is_favorite: row.get("is_favorite"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn delete(&self, id: RestaurantId, owner_id: UserId) -> Result<bool> {
        let result = sqlx::query("DELETE FROM restaurants WHERE id = $1 AND owner_id = $2")
            .bind(id.0)
            .bind(owner_id.0)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    async fn get_stats(&self, owner_id: UserId) -> Result<RestaurantStatsResponse> {
        let row = sqlx::query(
            r#"
            SELECT 
                COUNT(*) as total_restaurants,
                COUNT(*) FILTER (WHERE is_favorite = true) as total_favorites,
                COALESCE(ROUND(AVG(rating::numeric), 1), 0) as average_rating
            FROM restaurants 
            WHERE owner_id = $1
            "#
        )
        .bind(owner_id.0)
        .fetch_one(&self.pool)
        .await?;

        let average_rating: BigDecimal = row.get("average_rating");
        
        Ok(RestaurantStatsResponse {
            total_restaurants: row.get::<i64, _>("total_restaurants"),
            total_favorites: row.get::<i64, _>("total_favorites"),
            average_rating: average_rating.to_string(),
        })
    }
}