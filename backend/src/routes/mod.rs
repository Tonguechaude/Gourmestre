use crate::models::User;
use actix_web::{HttpResponse, Result, web};
use sqlx::PgPool;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/users")
            .route(web::get().to(get_users))
            .route(web::post().to(create_user)),
    );
}

async fn get_users(pool: web::Data<PgPool>) -> Result<HttpResponse> {
    let users = sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(pool.get_ref())
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Database error"))?;

    Ok(HttpResponse::Ok().json(users))
}

async fn create_user(_pool: web::Data<PgPool>, user: web::Json<User>) -> Result<HttpResponse> {
    Ok(HttpResponse::Created().json(&*user))
}
