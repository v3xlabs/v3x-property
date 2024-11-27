use poem::{error::ResponseError, IntoResponse, Response};
use poem_openapi::Enum;
use reqwest::StatusCode;

#[derive(Debug, Clone, Enum, thiserror::Error)]
pub enum HttpError {
    #[error("Not found")]
    NotFound,
}

impl ResponseError for HttpError{
    fn status(&self) -> StatusCode {
        match self {
            HttpError::NotFound => StatusCode::NOT_FOUND,
        }
    }

    fn as_response(&self) -> Response
        where
            Self: std::error::Error + Send + Sync + 'static,
    {
        self.status().into_response()
    }
}
