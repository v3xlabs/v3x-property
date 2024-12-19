use poem::web::Data;
use poem_openapi::{
    payload::{Json, PlainText},
    Object, OpenApi,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{
    printer::{PrinterInfo, PrintersInfo},
    state::AppState,
};
pub struct MainApi;

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Capabilities {
    pub printers: PrintersInfo,
}

#[OpenApi]
impl MainApi {
    #[oai(path = "/", method = "get")]
    async fn capabilities(&self) -> PlainText<String> {
        PlainText("Hello, world!".to_string())
    }

    #[oai(path = "/capabilities", method = "get")]
    async fn hello(&self, state: Data<&Arc<AppState>>) -> Json<Capabilities> {
        let printers = state.printers.get_info().await;

        Json(Capabilities { printers })
    }
}
