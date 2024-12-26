use std::collections::HashMap;

use ipp::{
    prelude::{AsyncIppClient, IppOperationBuilder},
    request::IppRequestResponse,
};
use poem::http::Uri;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use tracing::info;

pub mod testing;

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct PrintersInfo {
    pub printers: Vec<PrinterInfo>,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct PrinterInfo {
    pub name: String,
    pub metadata: HashMap<String, String>,
}

pub struct Printers {
    pub printers: Vec<Printer>,
}

impl Printers {
    pub async fn load() -> Self {
        let mut printers = Vec::new();

        let ipp_urls = std::env::var("IPP_URLS").unwrap();
        let ipp_urls = ipp_urls.split(',').collect::<Vec<&str>>();

        for ipp_url in ipp_urls {
            let ipp_url = ipp_url.trim();
            if ipp_url.is_empty() {
                continue;
            }

            let printer = Printer::new(ipp_url.to_string()).await;

            printers.push(printer);
        }

        Self { printers }
    }

    pub async fn get_info(&self) -> PrintersInfo {
        let mut printers = Vec::new();

        for printer in self.printers.iter() {
            let info = printer.get_info().await.unwrap();

            printers.push(info);
        }

        PrintersInfo { printers }
    }
}

pub struct Printer {
    pub uri: String,
}

impl Printer {
    pub async fn new(uri: String) -> Self {
        info!("Loading printer: {}", uri);

        let me = Self { uri };

        let response = me.get_status().await.unwrap();

        let payload = response.attributes().groups();

        for group in payload {
            for attribute in group.attributes() {
                let a = attribute.1.clone().into_value().to_string();
                let b = attribute.0;
                info!("Attribute: {:?} = {:?}", b, a);
            }
        }

        me
    }

    pub async fn get_status(&self) -> Result<IppRequestResponse, anyhow::Error> {
        let uri: Uri = self.uri.parse().unwrap();
        let operation = IppOperationBuilder::get_printer_attributes(uri.clone()).build();
        let client = AsyncIppClient::new(uri);
        let resp = client.send(operation).await.unwrap();

        Ok(resp)
    }

    pub async fn get_info(&self) -> Result<PrinterInfo, anyhow::Error> {
        let uri: Uri = self.uri.parse().unwrap();
        let operation = IppOperationBuilder::get_printer_attributes(uri.clone()).build();
        let client = AsyncIppClient::new(uri);
        let resp = client.send(operation).await.unwrap();
        let mut name = String::new();

        let mut hmap = HashMap::new();
        let map = resp.attributes().groups();

        for group in map {
            for attribute in group.attributes() {
                let a = attribute.1.clone().into_value().to_string();
                let b = attribute.0;

                if *b == "printer-name" {
                    name = a.clone();
                }

                hmap.insert(b.to_string(), a);
            }
        }

        Ok(PrinterInfo {
            name,
            metadata: hmap,
        })
    }
}
