use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Banner {
    pub id: Uuid,
    pub image_url: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub link_url: Option<String>,
    pub display_order: i32,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBannerRequest {
    pub image_url: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub link_url: Option<String>,
    pub display_order: Option<i32>,
}


