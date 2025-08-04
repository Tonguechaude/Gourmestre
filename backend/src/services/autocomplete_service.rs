use crate::domain::autocomplete::{
    AutocompleteSuggestion, OpenDataSoftResponse, AutocompleteResponse
};
use crate::error::{AppError, Result};
use std::sync::Arc;
use tracing::{error, info};

#[derive(Clone)]
pub struct AutocompleteService {
    client: Arc<reqwest::Client>,
}

impl AutocompleteService {
    /// Create a new autocomplete service
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .user_agent("Gourmestre/1.0")
            .timeout(std::time::Duration::from_secs(5))
            .build()
            .expect("Failed to create HTTP client");
        
        Self {
            client: Arc::new(client),
        }
    }

    /// Search for restaurant suggestions using OpenDataSoft API
    pub async fn search_restaurants(&self, search_term: &str) -> Result<AutocompleteResponse> {
        // Skip search for terms that are too short
        if search_term.len() < 2 {
            return Ok(AutocompleteResponse {
                suggestions: Vec::new(),
            });
        }

        info!("Searching restaurants with term: '{}'", search_term);

        let url = format!(
            "https://public.opendatasoft.com/api/records/1.0/search/?dataset=osm-france-food-service&q={}&rows=10",
            urlencoding::encode(search_term)
        );

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("OpenDataSoft API request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::Internal(format!(
                "OpenDataSoft API returned status: {}",
                response.status()
            )));
        }

        let api_response: OpenDataSoftResponse = response
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("Failed to parse OpenDataSoft response: {}", e)))?;

        let suggestions = self.parse_opendatasoft_response(api_response);
        
        info!("Found {} restaurant suggestions", suggestions.len());

        Ok(AutocompleteResponse { suggestions })
    }

    /// Parse OpenDataSoft response into suggestions
    fn parse_opendatasoft_response(&self, response: OpenDataSoftResponse) -> Vec<AutocompleteSuggestion> {
        let mut suggestions = Vec::new();

        for record in response.records {
            let fields = record.fields;
            if let Some(name) = fields.name {
                let city = fields
                    .meta_name_com
                    .or(fields.meta_name_dep)
                    .unwrap_or_else(|| "Ville inconnue".to_string());
                
                suggestions.push(AutocompleteSuggestion { name, city });
            }
        }

        suggestions
    }
}

impl Default for AutocompleteService {
    fn default() -> Self {
        Self::new()
    }
}