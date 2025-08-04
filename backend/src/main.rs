use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, web};
use sqlx::PgPool;

mod models;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();

    // Connexion PostgreSQL
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173") // Port Vite par défaut
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
