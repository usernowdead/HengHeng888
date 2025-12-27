use axum::{extract::State, Json, response::IntoResponse};
use sqlx::PgPool;
use crate::models::Banner;

pub async fn get_banners(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Banner>>, axum::response::Response> {
    let banners = sqlx::query_as::<_, Banner>(
        "SELECT * FROM banners WHERE is_active = true ORDER BY display_order ASC, created_at DESC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch banners: {}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR.into_response()
    })?;

    Ok(Json(banners))
}

