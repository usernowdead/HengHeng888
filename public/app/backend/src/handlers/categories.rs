use axum::{extract::State, Json, response::IntoResponse};
use sqlx::PgPool;
use crate::models::Category;

pub async fn get_categories(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Category>>, axum::response::Response> {
    let categories = sqlx::query_as::<_, Category>(
        "SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC, name ASC"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch categories: {}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR.into_response()
    })?;

    Ok(Json(categories))
}

