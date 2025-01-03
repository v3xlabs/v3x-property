use poem::error::ResponseError;
use poem::IntoResponse;
use reqwest::StatusCode;
use tracing::error;

#[derive(Debug, thiserror::Error)]
pub enum HttpError {
    #[error("Anyhow error: {0}")]
    AnyhowError(#[from] anyhow::Error),

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Search error: {0}")]
    SearchError(#[from] meilisearch_sdk::errors::Error),

    #[error("Already exists")]
    AlreadyExists,

    #[error("Resource not found")]
    NotFound,

    #[error("Forbidden")]
    Forbidden,
}

impl ResponseError for HttpError {
    fn as_response(&self) -> poem::Response
        where
            Self: std::error::Error + Send + Sync + 'static, {
        poem::Response::default().with_status(self.status()).into_response()
    }
    fn status(&self) -> StatusCode {
        match self {
            HttpError::AlreadyExists => StatusCode::CONFLICT,
            HttpError::NotFound => StatusCode::NOT_FOUND,
            HttpError::AnyhowError(error) => {
                error!("Anyhow error: {:?}", error);
                StatusCode::INTERNAL_SERVER_ERROR
            },
            HttpError::DatabaseError(error) => {
                error!("Database error: {:?}", error);
                StatusCode::INTERNAL_SERVER_ERROR
            },
            error => {
                error!("Error: {:?}", error);
                StatusCode::BAD_REQUEST
            },
        }
    }
}
