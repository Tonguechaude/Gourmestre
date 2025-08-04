use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// OpenDataSoft API response structure
#[derive(Debug, Deserialize)]
pub struct OpenDataSoftResponse {
    #[allow(dead_code)]
    pub nhits: i32,
    pub records: Vec<OpenDataSoftRecord>,
}

/// OpenDataSoft record structure
#[derive(Debug, Deserialize)]
pub struct OpenDataSoftRecord {
    pub fields: OpenDataSoftFields,
}

/// OpenDataSoft fields structure
#[derive(Debug, Deserialize)]
pub struct OpenDataSoftFields {
    pub name: Option<String>,
    pub meta_name_com: Option<String>,
    pub meta_name_dep: Option<String>,
    #[allow(dead_code)]
    #[serde(rename = "type")]
    pub restaurant_type: Option<String>,
    #[allow(dead_code)]
    pub cuisine: Option<String>,
}

/// Request structure for autocomplete search
#[derive(Debug, Deserialize, ToSchema)]
pub struct AutocompleteRequest {
    /// Search term (minimum 2 characters)
    #[schema(example = "pizza", min_length = 2)]
    pub search_term: String,
}

/// Response structure for autocomplete suggestions
#[derive(Debug, Serialize, ToSchema)]
pub struct AutocompleteSuggestion {
    /// Restaurant name
    #[schema(example = "Pizza Mario")]
    pub name: String,
    /// City where the restaurant is located
    #[schema(example = "Paris")]
    pub city: String,
}

/// Response containing list of autocomplete suggestions
#[derive(Debug, Serialize, ToSchema)]
pub struct AutocompleteResponse {
    /// List of restaurant suggestions  
    pub suggestions: Vec<AutocompleteSuggestion>,
}

impl From<(String, String)> for AutocompleteSuggestion {
    fn from((name, city): (String, String)) -> Self {
        Self { name, city }
    }
}