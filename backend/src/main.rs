use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use actix_session::{SessionMiddleware, storage::CookieSessionStore};
use actix_web::cookie::Key;
use std::sync::Arc;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use api_docs::ApiDoc;

mod api_docs;
mod config;
mod database;
mod domain;
mod error;
mod repositories;
mod services;
mod handlers;
mod routes;
mod models;

use config::Config;
use repositories::{
    user_repository::PostgresUserRepository,
    restaurant_repository::PostgresRestaurantRepository,
    wishlist_repository::PostgresWishlistRepository,
    session_repository::PostgresSessionRepository,
};
use services::{
    auth_service::AuthService,
    restaurant_service::RestaurantService,
    wishlist_service::WishlistService,
    user_service::UserService,
    autocomplete_service::AutocompleteService,
};
use handlers::{
    auth_handler::AuthHandler,
    restaurant_handler::RestaurantHandler,
    wishlist_handler::WishlistHandler,
    autocomplete_handler::AutocompleteHandler,
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    // Load configuration
    let config = Config::from_env().expect("Failed to load configuration");
    
    // Create database pool
    let pool = database::create_pool(&config)
        .await
        .expect("Failed to create database pool");

    // Create repositories
    let user_repo = Arc::new(PostgresUserRepository::new(pool.clone()));
    let restaurant_repo = Arc::new(PostgresRestaurantRepository::new(pool.clone()));
    let wishlist_repo = Arc::new(PostgresWishlistRepository::new(pool.clone()));
    let session_repo = Arc::new(PostgresSessionRepository::new(pool.clone()));

    // Create services
    let auth_service = Arc::new(AuthService::new(
        user_repo.clone(),
        session_repo.clone(),
        config.clone(),
    ));
    let restaurant_service = Arc::new(RestaurantService::new(restaurant_repo));
    let wishlist_service = Arc::new(WishlistService::new(wishlist_repo));
    let user_service = Arc::new(UserService::new(user_repo));
    let autocomplete_service = Arc::new(AutocompleteService::new());

    // Create handlers
    let auth_handler = Arc::new(AuthHandler::new(auth_service));
    let restaurant_handler = Arc::new(RestaurantHandler::new(restaurant_service));
    let wishlist_handler = Arc::new(WishlistHandler::new(wishlist_service));
    let autocomplete_handler = Arc::new(AutocompleteHandler::new(autocomplete_service));

    // Create session key
    let session_key = Key::from(config.session_key.as_bytes());

    let server_addr = format!("{}:{}", config.server_host, config.server_port);
    
    println!("🚀 Gourmestre API starting on http://{}", server_addr);
    println!("📊 Health check available at http://{}/health", server_addr);
    println!("📚 API documentation at http://{}/swagger-ui/", server_addr);
    println!("📋 OpenAPI spec at http://{}/api-docs/openapi.json", server_addr);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173")
            .allowed_origin("http://localhost:5174")
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Content-Type", "Authorization", "X-Requested-With"])
            .supports_credentials()
            .max_age(3600);

        App::new()
            // Add middleware
            .wrap(Logger::default())
            .wrap(cors)
            .wrap(
                SessionMiddleware::builder(
                    CookieSessionStore::default(),
                    session_key.clone()
                )
                .cookie_secure(false) // Set to true in production with HTTPS
                .cookie_http_only(true)
                .cookie_name("gourmestre_session".to_owned())
                .build()
            )
            
            // Add application data
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::from(auth_handler.clone()))
            .app_data(web::Data::from(restaurant_handler.clone()))
            .app_data(web::Data::from(wishlist_handler.clone()))
            .app_data(web::Data::from(autocomplete_handler.clone()))
            
            // Add Swagger UI
            .service(
                SwaggerUi::new("/swagger-ui/{_:.*}")
                    .url("/api-docs/openapi.json", ApiDoc::openapi())
            )
            
            // Configure routes
            .configure(routes::configure_routes)
    })
    .bind(&server_addr)?
    .run()
    .await
}
