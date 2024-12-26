use async_std::{fs::File, io::ReadExt};
use ipp::prelude::{AsyncIppClient, IppOperationBuilder, IppPayload};
use poem::{http::Uri, web::Data};
use poem_openapi::{
    payload::{Json, PlainText},
    Object, OpenApi,
};
use serde::{Deserialize, Serialize};
use tracing::info;
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

#[derive(Debug, Serialize, Deserialize, Object)]
pub struct PrintRequest {
    pub label_template: String,
    pub printer_id: String,
    pub label_id: String,
    pub url: String,
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

    #[oai(path = "/print", method = "post")]
    async fn print(&self, state: Data<&Arc<AppState>>, body: Json<PrintRequest>) -> Json<String> {
        info!("Printing label: {:?}", body);

        // TODO: get printer by id
        let printer = state.printers.printers.first().unwrap();
        info!("Printer: {:?}", printer.uri);

        let label = crate::printer::testing::generate_tag(body.label_id.parse().unwrap());

        let mut file = File::open("output.png").await.unwrap();

        let uri: Uri = printer.uri.parse().unwrap();
        let payload = IppPayload::new_async(file);
        let operation = IppOperationBuilder::print_job(uri.clone(), payload).build();
        let client = AsyncIppClient::new(uri.clone());
        let resp = client.send(operation).await.unwrap();
        let mut name = String::new();

        info!("Response: {:?}", resp.header());
        info!("Responsez: {:?}", resp.attributes());

        Json("Hello, world!".to_string())
    }
}
