use axum::{
	extract::Query,
	http::StatusCode,
	response::{IntoResponse, Response},
	routing::get,
	Json, Router,
};
use reqwest::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use url::Url;

#[derive(Serialize)]
struct Metadata {
	title: Option<String>,
	description: Option<String>,
	favicons: Vec<String>,
	preview_images: Vec<String>,
	url: String,
}

#[derive(Debug)]
enum AppError {
	InvalidUrl,
	FetchError,
}

impl IntoResponse for AppError {
	fn into_response(self) -> Response {
		let (status, message) = match self {
			AppError::InvalidUrl => (StatusCode::BAD_REQUEST, "Invalid URL"),
			AppError::FetchError => (StatusCode::BAD_GATEWAY, "Failed to fetch URL"),
		};
		(status, message).into_response()
	}
}

#[derive(Deserialize)]
struct MetadataQuery {
	url: String,
}

// Функциональный подход: чистые функции для извлечения данных
fn extract_text(document: &Html, selector: &str) -> Option<String> {
	Selector::parse(selector)
		.ok()
		.and_then(|sel| document.select(&sel).next())
		.map(|e| e.text().collect::<String>())
}

fn extract_attr(document: &Html, selector: &str, attr: &str) -> Option<String> {
	Selector::parse(selector)
		.ok()
		.and_then(|sel| document.select(&sel).next())
		.and_then(|e| e.value().attr(attr))
		.map(String::from)
}

fn extract_all_attrs(document: &Html, selector: &str, attr: &str) -> Vec<String> {
	Selector::parse(selector)
		.ok()
		.map(|sel| {
			document
				.select(&sel)
				.filter_map(|e| e.value().attr(attr))
				.map(String::from)
				.collect()
		})
		.unwrap_or_default()
}

fn extract_title(document: &Html) -> Option<String> {
	extract_text(document, "title")
		.or_else(|| extract_attr(document, r#"meta[property="og:title"]"#, "content"))
}

fn extract_description(document: &Html) -> Option<String> {
	extract_attr(document, r#"meta[name="description"]"#, "content")
		.or_else(|| extract_attr(document, r#"meta[property="og:description"]"#, "content"))
		.or_else(|| extract_attr(document, r#"meta[name="twitter:description"]"#, "content"))
}

fn extract_all_favicons(document: &Html, base_url: &Url) -> Vec<String> {
	let mut favicons = Vec::new();

	// Standard icon links
	favicons.extend(extract_all_attrs(document, r#"link[rel~="icon"]"#, "href"));
	favicons.extend(extract_all_attrs(document, r#"link[rel="shortcut icon"]"#, "href"));

	// Apple touch icons
	favicons.extend(extract_all_attrs(document, r#"link[rel="apple-touch-icon"]"#, "href"));
	favicons.extend(extract_all_attrs(document, r#"link[rel="apple-touch-icon-precomposed"]"#, "href"));

	// Microsoft tiles
	favicons.extend(extract_all_attrs(document, r#"meta[name="msapplication-TileImage"]"#, "content"));

	// Default favicon.ico if no icons found
	if favicons.is_empty() {
		favicons.push("/favicon.ico".to_string());
	}

	// Resolve all URLs and deduplicate
	favicons
		.into_iter()
		.filter_map(|href| resolve_url(base_url, &href))
		.collect::<std::collections::HashSet<_>>()
		.into_iter()
		.collect()
}

fn extract_all_preview_images(document: &Html, base_url: &Url) -> Vec<String> {
	let mut images = Vec::new();

	// Open Graph images
	images.extend(extract_all_attrs(document, r#"meta[property="og:image"]"#, "content"));
	images.extend(extract_all_attrs(document, r#"meta[property="og:image:url"]"#, "content"));
	images.extend(extract_all_attrs(document, r#"meta[property="og:image:secure_url"]"#, "content"));

	// Twitter images
	images.extend(extract_all_attrs(document, r#"meta[name="twitter:image"]"#, "content"));
	images.extend(extract_all_attrs(document, r#"meta[name="twitter:image:src"]"#, "content"));

	// Resolve all URLs and deduplicate
	images
		.into_iter()
		.filter_map(|href| resolve_url(base_url, &href))
		.collect::<std::collections::HashSet<_>>()
		.into_iter()
		.collect()
}

fn resolve_url(base: &Url, href: &str) -> Option<String> {
	base.join(href).ok().map(|u| u.to_string())
}

async fn fetch_html(client: &Client, url: &str) -> Result<String, AppError> {
	client
		.get(url)
		.send()
		.await
		.map_err(|_| AppError::FetchError)?
		.text()
		.await
		.map_err(|_| AppError::FetchError)
}

fn parse_metadata(html: &str, url: &Url) -> Result<Metadata, AppError> {
	let document = Html::parse_document(html);

	Ok(Metadata {
		title: extract_title(&document),
		description: extract_description(&document),
		favicons: extract_all_favicons(&document, url),
		preview_images: extract_all_preview_images(&document, url),
		url: url.to_string(),
	})
}

async fn fetch_metadata(client: &Client, url_str: String) -> Result<Metadata, AppError> {
	let url = Url::parse(&url_str).map_err(|_| AppError::InvalidUrl)?;
	let html = fetch_html(client, url.as_str()).await?;
	parse_metadata(&html, &url)
}

async fn metadata_handler(Query(params): Query<MetadataQuery>) -> Result<Json<Metadata>, AppError> {
	let client = Client::builder()
		.user_agent("Mozilla/5.0 (compatible; MetadataBot/1.0)")
		.timeout(std::time::Duration::from_secs(10))
		.build()
		.map_err(|_| AppError::FetchError)?;

	fetch_metadata(&client, params.url)
		.await
		.map(Json)
}

async fn health_check() -> &'static str {
	"OK"
}

#[tokio::main]
async fn main() {
	let cors = CorsLayer::new()
		.allow_origin(Any)
		.allow_methods(Any)
		.allow_headers(Any);

	let app = Router::new()
		.route("/api/metadata", get(metadata_handler))
		.route("/health", get(health_check))
		.layer(cors);

	let listener = tokio::net::TcpListener::bind("0.0.0.0:8091")
		.await
		.unwrap();

	println!("🌊 Server running on http://localhost:8091");
	axum::serve(listener, app).await.unwrap();
}
