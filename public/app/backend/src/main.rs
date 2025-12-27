mod handlers;
mod models;
mod database;
mod routes;

use axum::{
    Router,
    http::{Method, HeaderValue},
};
use tower_http::cors::{CorsLayer, Any};
use sqlx::PgPool;
use std::env;
use dotenv::dotenv;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Load database URL from environment
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    // Create database connection pool
    let pool = PgPool::connect(&database_url).await?;
    
    tracing::info!("Database connection established");

    // Build application with routes
    let app = Router::new()
        .merge(routes::create_routes())
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
                .allow_headers(Any)
                .expose_headers(Any)
                .max_age(std::time::Duration::from_secs(3600))
        )
        .with_state(pool);

    let port = env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse::<u16>()?;
    
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;
    
    tracing::info!("Server running on http://0.0.0.0:{}", port);
    
    axum::serve(listener, app).await?;

    Ok(())
}

