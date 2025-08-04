use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, web};
use sqlx::{PgPool, postgres::PgConnectOptions};
use std::str::FromStr;

mod models;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init();

    // Connexion PostgreSQL
    let connect_options = PgConnectOptions::new()
        .host("127.0.0.1")
        .port(5432)
        .username("u_gourmestre")
        .password("tongue")
        .database("Gourmestre");
    
    let pool = PgPool::connect_with(connect_options)
        .await
        .expect("Failed to connect to database");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173") // Port Vite par défaut
            .allowed_origin("http://localhost:5174") // Port alternatif Vite
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec!["Content-Type", "Authorization"]);

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .service(web::scope("/api/v1").configure(routes::config))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
