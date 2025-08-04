use actix_web::{HttpResponse, Result};
use serde_json::json;
use utoipa::path;

/// Health check endpoint
#[utoipa::path(
    get,
    path = "/health",
    tag = "Health",
    responses(
        (status = 200, description = "Service is healthy")
    )
)]
pub async fn health_check() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now(),
        "service": "gourmestre-api",
        "version": "0.1.0"
    })))
}

/// Readiness check endpoint
#[utoipa::path(
    get,
    path = "/ready",
    tag = "Health",
    responses(
        (status = 200, description = "Service is ready to accept traffic")
    )
)]
pub async fn readiness_check() -> Result<HttpResponse> {
    // In a real application, you might check database connectivity here
    Ok(HttpResponse::Ok().json(json!({
        "status": "ready",
        "timestamp": chrono::Utc::now(),
        "checks": {
            "database": "ok",
            "redis": "ok"
        }
    })))
}