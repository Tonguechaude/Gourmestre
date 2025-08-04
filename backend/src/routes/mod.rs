use crate::handlers::{
    auth_handler::AuthHandler,
    restaurant_handler::RestaurantHandler,
    wishlist_handler::WishlistHandler,
    autocomplete_handler::AutocompleteHandler,
    health_handler,
};
use crate::domain::user::{RegisterUserCommand, LoginCommand, RegisterResponse, UserResponse};
use crate::domain::restaurant::{
    CreateRestaurantRequest, UpdateRestaurantRequest, RestaurantResponse, RestaurantStatsResponse
};
use crate::domain::wishlist::{
    CreateWishlistRequest, UpdateWishlistRequest, WishlistItemResponse, WishlistCountResponse
};
use crate::domain::autocomplete::{AutocompleteRequest, AutocompleteResponse};
use crate::error::AppError;
use actix_web::web;
use utoipa::path;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health endpoints
        .route("/health", web::get().to(health_handler::health_check))
        .route("/ready", web::get().to(health_handler::readiness_check))
        
        // API v1 routes
        .service(
            web::scope("/api/v1")
                .configure(auth_routes)
                .configure(restaurant_routes)
                .configure(wishlist_routes)
                .configure(autocomplete_routes)
        );
}

fn auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/register", web::post().to(register))
            .route("/login", web::post().to(login))
            .route("/logout", web::post().to(logout))
            .route("/me", web::get().to(get_user_info))
            .route("/check", web::get().to(check_auth))
    );
}

fn restaurant_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/restaurants")
            .route("", web::get().to(get_restaurants))
            .route("", web::post().to(create_restaurant))
            .route("/stats", web::get().to(get_restaurant_stats))
            .route("/search", web::post().to(search_restaurants))
            .route("/{id}", web::get().to(get_restaurant))
            .route("/{id}", web::put().to(update_restaurant))
            .route("/{id}", web::delete().to(delete_restaurant))
    );
}

fn wishlist_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/wishlist")
            .route("", web::get().to(get_wishlist_items))
            .route("", web::post().to(create_wishlist_item))
            .route("/count", web::get().to(get_wishlist_count))
            .route("/priority/{priority}", web::get().to(get_items_by_priority))
            .route("/{id}", web::get().to(get_wishlist_item))
            .route("/{id}", web::put().to(update_wishlist_item))
            .route("/{id}", web::delete().to(delete_wishlist_item))
            .route("/{id}/promote", web::post().to(promote_wishlist_item))
    );
}

// Auth handlers
#[utoipa::path(
    post,
    path = "/api/v1/auth/register",
    tag = "Authentication",
    request_body = RegisterUserCommand,
    responses(
        (status = 201, description = "User registered successfully", body = RegisterResponse),
        (status = 400, description = "Validation error", body = AppError),
        (status = 409, description = "Username already exists", body = AppError)
    )
)]
async fn register(
    auth_handler: web::Data<AuthHandler>,
    req: web::Json<crate::domain::user::RegisterUserCommand>,
) -> crate::error::Result<actix_web::HttpResponse> {
    auth_handler.register(req).await
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    tag = "Authentication",
    request_body = LoginCommand,
    responses(
        (status = 200, description = "Login successful"),
        (status = 401, description = "Invalid credentials", body = AppError)
    )
)]
async fn login(
    auth_handler: web::Data<AuthHandler>,
    req: web::Json<crate::domain::user::LoginCommand>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    auth_handler.login(req, session).await
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/logout",
    tag = "Authentication",
    responses(
        (status = 200, description = "Logout successful"),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn logout(
    auth_handler: web::Data<AuthHandler>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    auth_handler.logout(session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/me",
    tag = "Authentication",
    responses(
        (status = 200, description = "User information retrieved", body = UserResponse),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn get_user_info(
    auth_handler: web::Data<AuthHandler>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    auth_handler.get_user_info(session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/check",
    tag = "Authentication",
    responses(
        (status = 200, description = "User is authenticated"),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn check_auth(
    auth_handler: web::Data<AuthHandler>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    auth_handler.check_auth(session).await
}

// Restaurant handlers
#[utoipa::path(
    post,
    path = "/api/v1/restaurants",
    tag = "Restaurants",
    request_body = CreateRestaurantRequest,
    responses(
        (status = 201, description = "Restaurant created successfully", body = RestaurantResponse),
        (status = 400, description = "Validation error", body = AppError),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn create_restaurant(
    restaurant_handler: web::Data<RestaurantHandler>,
    req: web::Json<crate::domain::restaurant::CreateRestaurantRequest>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    restaurant_handler.create(req, session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/restaurants",
    tag = "Restaurants",
    params(
        ("favorites" = Option<bool>, Query, description = "Filter by favorite restaurants only"),
        ("limit" = Option<i64>, Query, description = "Maximum number of results")
    ),
    responses(
        (status = 200, description = "List of restaurants", body = Vec<RestaurantResponse>),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn get_restaurants(
    restaurant_handler: web::Data<RestaurantHandler>,
    query: web::Query<crate::domain::restaurant::RestaurantQuery>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    restaurant_handler.get_restaurants(query, session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/restaurants/{id}",
    tag = "Restaurants",
    params(
        ("id" = i32, Path, description = "Restaurant ID")
    ),
    responses(
        (status = 200, description = "Restaurant details", body = RestaurantResponse),
        (status = 401, description = "Not authenticated", body = AppError),
        (status = 404, description = "Restaurant not found", body = AppError)
    )
)]
async fn get_restaurant(
    restaurant_handler: web::Data<RestaurantHandler>,
    path: web::Path<i32>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    restaurant_handler.get_restaurant(path, session).await
}

#[utoipa::path(
    put,
    path = "/api/v1/restaurants/{id}",
    tag = "Restaurants",
    params(
        ("id" = i32, Path, description = "Restaurant ID")
    ),
    request_body = UpdateRestaurantRequest,
    responses(
        (status = 200, description = "Restaurant updated successfully", body = RestaurantResponse),
        (status = 400, description = "Validation error", body = AppError),
        (status = 401, description = "Not authenticated", body = AppError),
        (status = 404, description = "Restaurant not found", body = AppError)
    )
)]
async fn update_restaurant(
    restaurant_handler: web::Data<RestaurantHandler>,
    path: web::Path<i32>,
    req: web::Json<crate::domain::restaurant::UpdateRestaurantRequest>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    restaurant_handler.update(path, req, session).await
}

#[utoipa::path(
    delete,
    path = "/api/v1/restaurants/{id}",
    tag = "Restaurants",
    params(
        ("id" = i32, Path, description = "Restaurant ID")
    ),
    responses(
        (status = 200, description = "Restaurant deleted successfully"),
        (status = 401, description = "Not authenticated", body = AppError),
        (status = 404, description = "Restaurant not found", body = AppError)
    )
)]
async fn delete_restaurant(
    restaurant_handler: web::Data<RestaurantHandler>,
    path: web::Path<i32>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    restaurant_handler.delete(path, session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/restaurants/stats",
    tag = "Restaurants",
    responses(
        (status = 200, description = "Restaurant statistics", body = RestaurantStatsResponse),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn get_restaurant_stats(
    restaurant_handler: web::Data<RestaurantHandler>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    restaurant_handler.get_stats(session).await
}

#[utoipa::path(
    post,
    path = "/api/v1/restaurants/search",
    tag = "Restaurants",
    responses(
        (status = 200, description = "Search results", body = Vec<RestaurantResponse>),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn search_restaurants(
    restaurant_handler: web::Data<RestaurantHandler>,
    query: web::Query<serde_json::Value>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    restaurant_handler.search(query, session).await
}

// Wishlist handlers
#[utoipa::path(
    post,
    path = "/api/v1/wishlist",
    tag = "Wishlist",
    request_body = CreateWishlistRequest,
    responses(
        (status = 201, description = "Wishlist item created successfully", body = WishlistItemResponse),
        (status = 400, description = "Validation error", body = AppError),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn create_wishlist_item(
    wishlist_handler: web::Data<WishlistHandler>,
    req: web::Json<crate::domain::wishlist::CreateWishlistRequest>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.create(req, session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/wishlist",
    tag = "Wishlist",
    params(
        ("priority" = Option<String>, Query, description = "Filter by priority (low, medium, high)"),
        ("limit" = Option<i64>, Query, description = "Maximum number of results")
    ),
    responses(
        (status = 200, description = "List of wishlist items", body = Vec<WishlistItemResponse>),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn get_wishlist_items(
    wishlist_handler: web::Data<WishlistHandler>,
    query: web::Query<crate::domain::wishlist::WishlistQuery>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.get_items(query, session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/wishlist/{id}",
    tag = "Wishlist",
    params(
        ("id" = i32, Path, description = "Wishlist item ID")
    ),
    responses(
        (status = 200, description = "Wishlist item details", body = WishlistItemResponse),
        (status = 401, description = "Not authenticated", body = AppError),
        (status = 404, description = "Wishlist item not found", body = AppError)
    )
)]
async fn get_wishlist_item(
    wishlist_handler: web::Data<WishlistHandler>,
    path: web::Path<i32>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.get_item(path, session).await
}

#[utoipa::path(
    put,
    path = "/api/v1/wishlist/{id}",
    tag = "Wishlist",
    params(
        ("id" = i32, Path, description = "Wishlist item ID")
    ),
    request_body = UpdateWishlistRequest,
    responses(
        (status = 200, description = "Wishlist item updated successfully", body = WishlistItemResponse),
        (status = 400, description = "Validation error", body = AppError),
        (status = 401, description = "Not authenticated", body = AppError),
        (status = 404, description = "Wishlist item not found", body = AppError)
    )
)]
async fn update_wishlist_item(
    wishlist_handler: web::Data<WishlistHandler>,
    path: web::Path<i32>,
    req: web::Json<crate::domain::wishlist::UpdateWishlistRequest>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.update(path, req, session).await
}

#[utoipa::path(
    delete,
    path = "/api/v1/wishlist/{id}",
    tag = "Wishlist",
    params(
        ("id" = i32, Path, description = "Wishlist item ID")
    ),
    responses(
        (status = 200, description = "Wishlist item deleted successfully"),
        (status = 401, description = "Not authenticated", body = AppError),
        (status = 404, description = "Wishlist item not found", body = AppError)
    )
)]
async fn delete_wishlist_item(
    wishlist_handler: web::Data<WishlistHandler>,
    path: web::Path<i32>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.delete(path, session).await
}

#[utoipa::path(
    get,
    path = "/api/v1/wishlist/count",
    tag = "Wishlist",
    responses(
        (status = 200, description = "Wishlist item count", body = WishlistCountResponse),
        (status = 401, description = "Not authenticated", body = AppError)
    )
)]
async fn get_wishlist_count(
    wishlist_handler: web::Data<WishlistHandler>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.get_count(session).await
}

#[utoipa::path(
    post,
    path = "/api/v1/wishlist/{id}/promote",
    tag = "Wishlist",
    params(
        ("id" = i32, Path, description = "Wishlist item ID")
    ),
    responses(
        (status = 200, description = "Wishlist item promoted to restaurant successfully", body = RestaurantResponse),
        (status = 401, description = "Not authenticated", body = AppError),
        (status = 404, description = "Wishlist item not found", body = AppError)
    )
)]
async fn promote_wishlist_item(
    wishlist_handler: web::Data<WishlistHandler>,
    path: web::Path<i32>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.promote(path, session).await
}

async fn get_items_by_priority(
    wishlist_handler: web::Data<WishlistHandler>,
    path: web::Path<String>,
    session: actix_session::Session,
) -> crate::error::Result<actix_web::HttpResponse> {
    wishlist_handler.get_by_priority(path, session).await
}

fn autocomplete_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/autocomplete")
            .route("/restaurants", web::post().to(search_restaurants_autocomplete))
            .route("/wishlist", web::post().to(search_wishlist_autocomplete))
    );
}

#[utoipa::path(
    post,
    path = "/api/v1/autocomplete/restaurants",
    tag = "Autocomplete",
    request_body = AutocompleteRequest,
    responses(
        (status = 200, description = "Restaurant suggestions", body = AutocompleteResponse),
        (status = 400, description = "Validation error", body = AppError)
    )
)]
async fn search_restaurants_autocomplete(
    autocomplete_handler: web::Data<AutocompleteHandler>,
    req: web::Json<AutocompleteRequest>,
) -> crate::error::Result<actix_web::HttpResponse> {
    autocomplete_handler.search_restaurants(req).await
}

#[utoipa::path(
    post,
    path = "/api/v1/autocomplete/wishlist",
    tag = "Autocomplete",
    request_body = AutocompleteRequest,
    responses(
        (status = 200, description = "Wishlist suggestions", body = AutocompleteResponse),
        (status = 400, description = "Validation error", body = AppError)
    )
)]
async fn search_wishlist_autocomplete(
    autocomplete_handler: web::Data<AutocompleteHandler>,
    req: web::Json<AutocompleteRequest>,
) -> crate::error::Result<actix_web::HttpResponse> {
    autocomplete_handler.search_wishlist(req).await
}