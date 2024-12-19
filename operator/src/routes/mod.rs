use poem_openapi::{payload::{Json, PlainText}, Object, OpenApi};
use serde::{Deserialize, Serialize};
pub struct MainApi;

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct Capabilities {
    pub printers: Vec<String>,
}

#[OpenApi]
impl MainApi {
    #[oai(path = "/", method = "get")]
    async fn hello(&self) -> Json<Capabilities> {
        Json(Capabilities { printers: vec![] })
    }

    #[oai(path = "/capabilities", method = "get")]
    async fn capabilities(&self) -> PlainText<String> {
        PlainText("Hello, world!".to_string())
    }
}
