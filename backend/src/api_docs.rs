use utoipa::OpenApi;
use utoipa::openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme};

use crate::domain::user::{RegisterUserCommand, LoginCommand, UserResponse};
use crate::domain::restaurant::{
    CreateRestaurantRequest, UpdateRestaurantRequest, RestaurantResponse, RestaurantStatsResponse
};
use crate::domain::wishlist::{
    CreateWishlistRequest, UpdateWishlistRequest, WishlistItemResponse, WishlistCountResponse
};
use crate::domain::autocomplete::{AutocompleteRequest, AutocompleteResponse};
use crate::models::ApiResponse;
use crate::error::AppError;

#[derive(OpenApi)]
#[openapi(
    paths(
        // Auth endpoints
        crate::routes::register,
        crate::routes::login,
        crate::routes::logout,
        crate::routes::get_user_info,
        crate::routes::check_auth,
        
        // Restaurant endpoints
        crate::routes::create_restaurant,
        crate::routes::get_restaurants,
        crate::routes::get_restaurant,
        crate::routes::update_restaurant,
        crate::routes::delete_restaurant,
        crate::routes::get_restaurant_stats,
        crate::routes::search_restaurants,
        
        // Wishlist endpoints
        crate::routes::create_wishlist_item,
        crate::routes::get_wishlist_items,
        crate::routes::get_wishlist_item,
        crate::routes::update_wishlist_item,
        crate::routes::delete_wishlist_item,
        crate::routes::get_wishlist_count,
        crate::routes::promote_wishlist_item,
        
        // Health endpoints
        crate::handlers::health_handler::health_check,
        crate::handlers::health_handler::readiness_check,
        
        // Autocomplete endpoints
        crate::routes::search_restaurants_autocomplete,
        crate::routes::search_wishlist_autocomplete,
    ),
    components(
        schemas(
            // Request/Response models
            RegisterUserCommand,
            LoginCommand,
            UserResponse,
            CreateRestaurantRequest,
            UpdateRestaurantRequest,
            RestaurantResponse,
            RestaurantStatsResponse,
            CreateWishlistRequest,
            UpdateWishlistRequest,
            WishlistItemResponse,
            WishlistCountResponse,
            AutocompleteRequest,
            AutocompleteResponse,
            ApiResponse<serde_json::Value>,
            AppError,
        )
    ),
    tags(
        (name = "Authentication", description = "User authentication and session management"),
        (name = "Restaurants", description = "Restaurant management operations"),
        (name = "Wishlist", description = "Wishlist management operations"),
        (name = "Autocomplete", description = "Restaurant autocomplete suggestions using OpenDataSoft API"),
        (name = "Health", description = "Health check and monitoring endpoints"),
    ),
    info(
        title = "Gourmestre API",
        version = "1.0.0",
        description = "A comprehensive restaurant management and wishlist API for food enthusiasts",
        contact(
            name = "Gourmestre Support",
            email = "support@gourmestre.app"
        ),
        license(
            name = "MIT",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers(
        (url = "http://localhost:8080", description = "Local development server"),
        (url = "https://api.gourmestre.app", description = "Production server")
    ),
    security(
        ("session_auth" = [])
    )
)]
pub struct ApiDoc;

impl ApiDoc {
    pub fn security_scheme() -> SecurityScheme {
        SecurityScheme::Http(
            HttpBuilder::new()
                .scheme(HttpAuthScheme::Bearer)
                .description(Some("Session-based authentication using cookies"))
                .build()
        )
    }
}