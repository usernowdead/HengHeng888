use axum::{extract::State, Json, response::IntoResponse};
use sqlx::PgPool;
use uuid::Uuid;
use crate::models::{CreateProductRequest, DeleteProductRequest, CreateBannerRequest};

pub async fn create_product(
    State(pool): State<PgPool>,
    Json(req): Json<CreateProductRequest>,
) -> Result<Json<serde_json::Value>, axum::response::Response> {
    let product_id = sqlx::query_scalar::<_, Uuid>(
        r#"
        INSERT INTO products (category_id, name, slug, description, price, image_url, platform, version, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
        "#
    )
    .bind(req.category_id)
    .bind(req.name)
    .bind(req.slug)
    .bind(req.description)
    .bind(req.price)
    .bind(req.image_url)
    .bind(req.platform)
    .bind(req.version)
    .bind(req.display_order.unwrap_or(0))
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create product: {}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR.into_response()
    })?;

    Ok(Json(serde_json::json!({
        "success": true,
        "id": product_id
    })))
}

pub async fn delete_product(
    State(pool): State<PgPool>,
    Json(req): Json<DeleteProductRequest>,
) -> Result<Json<serde_json::Value>, axum::response::Response> {
    sqlx::query("DELETE FROM products WHERE id = $1")
        .bind(req.id)
        .execute(&pool)
        .await
        .map_err(|e| {
            tracing::error!("Failed to delete product: {}", e);
            axum::http::StatusCode::INTERNAL_SERVER_ERROR.into_response()
        })?;

    Ok(Json(serde_json::json!({
        "success": true
    })))
}

pub async fn create_banner(
    State(pool): State<PgPool>,
    Json(req): Json<CreateBannerRequest>,
) -> Result<Json<serde_json::Value>, axum::response::Response> {
    let banner_id = sqlx::query_scalar::<_, Uuid>(
        r#"
        INSERT INTO banners (image_url, title, description, link_url, display_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        "#
    )
    .bind(req.image_url)
    .bind(req.title)
    .bind(req.description)
    .bind(req.link_url)
    .bind(req.display_order.unwrap_or(0))
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create banner: {}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR.into_response()
    })?;

    Ok(Json(serde_json::json!({
        "success": true,
        "id": banner_id
    })))
}

