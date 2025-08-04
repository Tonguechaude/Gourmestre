use crate::domain::wishlist::{WishlistItem, WishlistId, CreateWishlistItem, UpdateWishlistItem, WishlistPriority, WishlistCountResponse};
use crate::domain::user::UserId;
use crate::error::Result;
use crate::database::DbPool;
use async_trait::async_trait;
use sqlx::Row;

#[async_trait]
pub trait WishlistRepository: Send + Sync {
    async fn create(&self, item: CreateWishlistItem) -> Result<WishlistItem>;
    async fn find_by_id(&self, id: WishlistId) -> Result<Option<WishlistItem>>;
    async fn find_by_owner(&self, owner_id: UserId, priority: Option<WishlistPriority>, limit: Option<i64>) -> Result<Vec<WishlistItem>>;
    async fn update(&self, item: UpdateWishlistItem) -> Result<Option<WishlistItem>>;
    async fn delete(&self, id: WishlistId, owner_id: UserId) -> Result<bool>;
    async fn get_count(&self, owner_id: UserId) -> Result<WishlistCountResponse>;
    async fn promote_to_restaurant(&self, id: WishlistId, owner_id: UserId) -> Result<bool>;
}

pub struct PostgresWishlistRepository {
    pool: DbPool,
}

impl PostgresWishlistRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl WishlistRepository for PostgresWishlistRepository {
    async fn create(&self, item: CreateWishlistItem) -> Result<WishlistItem> {
        let priority_str = match item.priority {
            WishlistPriority::Low => "low",
            WishlistPriority::Medium => "medium",
            WishlistPriority::High => "high",
        };

        let row = sqlx::query(
            r#"
            INSERT INTO wishlist_items (owner_id, name, city, notes, priority, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING id, owner_id, name, city, notes, priority, created_at, updated_at
            "#
        )
        .bind(item.owner_id.0)
        .bind(&item.name)
        .bind(&item.city)
        .bind(&item.notes)
        .bind(priority_str)
        .fetch_one(&self.pool)
        .await?;

        let priority_str: String = row.get("priority");
        let priority = match priority_str.as_str() {
            "low" => WishlistPriority::Low,
            "medium" => WishlistPriority::Medium,
            "high" => WishlistPriority::High,
            _ => WishlistPriority::Medium,
        };

        Ok(WishlistItem {
            id: WishlistId(row.get("id")),
            owner_id: UserId(row.get("owner_id")),
            name: row.get("name"),
            city: row.get("city"),
            notes: row.get("notes"),
            priority,
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    async fn find_by_id(&self, id: WishlistId) -> Result<Option<WishlistItem>> {
        let row = sqlx::query(
            r#"
            SELECT id, owner_id, name, city, notes, priority, created_at, updated_at
            FROM wishlist_items 
            WHERE id = $1
            "#
        )
        .bind(id.0)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let priority_str: String = row.get("priority");
            let priority = match priority_str.as_str() {
                "low" => WishlistPriority::Low,
                "medium" => WishlistPriority::Medium,
                "high" => WishlistPriority::High,
                _ => WishlistPriority::Medium,
            };

            Ok(Some(WishlistItem {
                id: WishlistId(row.get("id")),
                owner_id: UserId(row.get("owner_id")),
                name: row.get("name"),
                city: row.get("city"),
                notes: row.get("notes"),
                priority,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn find_by_owner(&self, owner_id: UserId, priority: Option<WishlistPriority>, limit: Option<i64>) -> Result<Vec<WishlistItem>> {
        let mut query = String::from(
            r#"
            SELECT id, owner_id, name, city, notes, priority, created_at, updated_at
            FROM wishlist_items 
            WHERE owner_id = $1
            "#
        );

        if priority.is_some() {
            query.push_str(" AND priority = $2");
        }

        query.push_str(" ORDER BY priority DESC, created_at DESC");

        if let Some(limit) = limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        let mut sqlx_query = sqlx::query(&query).bind(owner_id.0);

        if let Some(priority) = priority {
            let priority_str = match priority {
                WishlistPriority::Low => "low",
                WishlistPriority::Medium => "medium",
                WishlistPriority::High => "high",
            };
            sqlx_query = sqlx_query.bind(priority_str);
        }

        let rows = sqlx_query.fetch_all(&self.pool).await?;

        let items = rows.into_iter().map(|row| {
            let priority_str: String = row.get("priority");
            let priority = match priority_str.as_str() {
                "low" => WishlistPriority::Low,
                "medium" => WishlistPriority::Medium,
                "high" => WishlistPriority::High,
                _ => WishlistPriority::Medium,
            };

            WishlistItem {
                id: WishlistId(row.get("id")),
                owner_id: UserId(row.get("owner_id")),
                name: row.get("name"),
                city: row.get("city"),
                notes: row.get("notes"),
                priority,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }
        }).collect();

        Ok(items)
    }

    async fn update(&self, item: UpdateWishlistItem) -> Result<Option<WishlistItem>> {
        let mut query_parts = Vec::new();
        let mut param_count = 1;

        if let Some(name) = &item.name {
            query_parts.push(format!("name = ${}", param_count));
            param_count += 1;
        }

        if let Some(city) = &item.city {
            query_parts.push(format!("city = ${}", param_count));
            param_count += 1;
        }

        if let Some(notes) = &item.notes {
            query_parts.push(format!("notes = ${}", param_count));
            param_count += 1;
        }

        if let Some(priority) = item.priority {
            query_parts.push(format!("priority = ${}", param_count));
            param_count += 1;
        }

        if query_parts.is_empty() {
            return self.find_by_id(item.id).await;
        }

        query_parts.push("updated_at = NOW()".to_string());

        let query = format!(
            r#"
            UPDATE wishlist_items 
            SET {}
            WHERE id = ${} AND owner_id = ${}
            RETURNING id, owner_id, name, city, notes, priority, created_at, updated_at
            "#,
            query_parts.join(", "),
            param_count,
            param_count + 1
        );

        let mut sqlx_query = sqlx::query(&query);

        if let Some(name) = &item.name {
            sqlx_query = sqlx_query.bind(name);
        }
        if let Some(city) = &item.city {
            sqlx_query = sqlx_query.bind(city);
        }
        if let Some(notes) = &item.notes {
            sqlx_query = sqlx_query.bind(notes);
        }
        if let Some(priority) = item.priority {
            let priority_str = match priority {
                WishlistPriority::Low => "low",
                WishlistPriority::Medium => "medium",
                WishlistPriority::High => "high",
            };
            sqlx_query = sqlx_query.bind(priority_str);
        }

        sqlx_query = sqlx_query.bind(item.id.0).bind(item.owner_id.0);

        let row = sqlx_query.fetch_optional(&self.pool).await?;

        if let Some(row) = row {
            let priority_str: String = row.get("priority");
            let priority = match priority_str.as_str() {
                "low" => WishlistPriority::Low,
                "medium" => WishlistPriority::Medium,
                "high" => WishlistPriority::High,
                _ => WishlistPriority::Medium,
            };

            Ok(Some(WishlistItem {
                id: WishlistId(row.get("id")),
                owner_id: UserId(row.get("owner_id")),
                name: row.get("name"),
                city: row.get("city"),
                notes: row.get("notes"),
                priority,
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    async fn delete(&self, id: WishlistId, owner_id: UserId) -> Result<bool> {
        let result = sqlx::query("DELETE FROM wishlist_items WHERE id = $1 AND owner_id = $2")
            .bind(id.0)
            .bind(owner_id.0)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    async fn get_count(&self, owner_id: UserId) -> Result<WishlistCountResponse> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM wishlist_items WHERE owner_id = $1")
            .bind(owner_id.0)
            .fetch_one(&self.pool)
            .await?;

        Ok(WishlistCountResponse {
            count: row.get::<i64, _>("count"),
        })
    }

    async fn promote_to_restaurant(&self, id: WishlistId, owner_id: UserId) -> Result<bool> {
        let mut tx = self.pool.begin().await?;

        // Get the wishlist item
        let wishlist_item = sqlx::query("SELECT name, city, notes FROM wishlist_items WHERE id = $1 AND owner_id = $2")
            .bind(id.0)
            .bind(owner_id.0)
            .fetch_optional(&mut *tx)
            .await?;

        if let Some(item) = wishlist_item {
            let name: String = item.get("name");
            let city: String = item.get("city");
            let notes: Option<String> = item.get("notes");

            // Create restaurant from wishlist item
            sqlx::query(
                r#"
                INSERT INTO restaurants (owner_id, name, city, description, is_favorite, created_at, updated_at)
                VALUES ($1, $2, $3, $4, false, NOW(), NOW())
                "#
            )
            .bind(owner_id.0)
            .bind(&name)
            .bind(&city)
            .bind(&notes)
            .execute(&mut *tx)
            .await?;

            // Delete wishlist item
            sqlx::query("DELETE FROM wishlist_items WHERE id = $1 AND owner_id = $2")
                .bind(id.0)
                .bind(owner_id.0)
                .execute(&mut *tx)
                .await?;

            tx.commit().await?;
            Ok(true)
        } else {
            tx.rollback().await?;
            Ok(false)
        }
    }
}