use crate::domain::autocomplete::{AutocompleteRequest, AutocompleteResponse};
use crate::error::Result;
use crate::services::autocomplete_service::AutocompleteService;
use actix_web::{web, HttpResponse};
use std::sync::Arc;
use tracing::info;

pub struct AutocompleteHandler {
    service: Arc<AutocompleteService>,
}

impl AutocompleteHandler {
    pub fn new(service: Arc<AutocompleteService>) -> Self {
        Self { service }
    }

    /// Handle restaurant autocomplete search
    pub async fn search_restaurants(
        &self,
        req: web::Json<AutocompleteRequest>,
    ) -> Result<HttpResponse> {
        info!("Processing restaurant autocomplete request: '{}'", req.search_term);

        let response = self.service.search_restaurants(&req.search_term).await?;
        
        Ok(HttpResponse::Ok().json(response))
    }

    /// Handle wishlist autocomplete search (same as restaurants)
    pub async fn search_wishlist(
        &self,
        req: web::Json<AutocompleteRequest>,
    ) -> Result<HttpResponse> {
        info!("Processing wishlist autocomplete request: '{}'", req.search_term);

        let response = self.service.search_restaurants(&req.search_term).await?;
        
        Ok(HttpResponse::Ok().json(response))
    }
}