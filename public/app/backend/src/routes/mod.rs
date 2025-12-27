use axum::{
    Router,
    routing::{get, post},
};
use crate::handlers::{banners::get_banners, products::get_products, categories::get_categories};
use crate::handlers::admin::{create_product, delete_product, create_banner};
use crate::database::DbPool;

pub fn create_routes() -> Router<DbPool> {
    Router::new()
        .route("/api/banners", get(get_banners))
        .route("/api/categories", get(get_categories))
        .route("/api/products", get(get_products))
        .route("/api/admin/product", post(create_product))
        .route("/api/admin/product/delete", post(delete_product))
        .route("/api/admin/banner", post(create_banner))
}

