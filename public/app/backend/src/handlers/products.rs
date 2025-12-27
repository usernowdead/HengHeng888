use axum::{extract::{State, Query}, Json, response::IntoResponse};
use sqlx::PgPool;
use serde::Deserialize;
use crate::models::Product;

#[derive(Debug, Deserialize)]
pub struct ProductQuery {
    pub category: Option<String>,
}

pub async fn get_products(
    State(pool): State<PgPool>,
    Query(query): Query<ProductQuery>,
) -> Result<Json<Vec<Product>>, axum::response::Response> {
    let products = if let Some(category_slug) = query.category {
        sqlx::query_as::<_, Product>(
            r#"
            SELECT p.* FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE c.slug = $1 AND p.is_active = true
            ORDER BY p.display_order ASC, p.created_at DESC
            "#
        )
        .bind(category_slug)
        .fetch_all(&pool)
        .await
    } else {
        sqlx::query_as::<_, Product>(
            "SELECT * FROM products WHERE is_active = true ORDER BY display_order ASC, created_at DESC"
        )
        .fetch_all(&pool)
        .await
    }
    .map_err(|e| {
        tracing::error!("Failed to fetch products: {}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR.into_response()
    })?;

    Ok(Json(products))
}

