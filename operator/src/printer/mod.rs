use std::collections::HashMap;

use ipp::{
    prelude::{AsyncIppClient, IppOperationBuilder},
    request::IppRequestResponse,
};
use poem::http::Uri;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};
use tracing::info;

// println!("Hello, world!");
// let label = Label::new(1);
// LabelTemplate::G1QR.print(&label).unwrap();
// println!("Hello, worldz!");
// let devices = brother_ql_rs::printer::printers();
// if devices.is_empty() {
//     println!("No devices found");
//     return;
// }
// let device = devices.into_iter().next().unwrap();
// println!("Device: {:?}", device);
// let printer = ThermalPrinter::new(device).unwrap();
// println!("Printer: {:?}", printer.manufacturer);
// println!("Printer: {:?}", printer.model);
// println!("Printer: {:?}", printer.serial_number);
// println!("Printer: {:?}", printer.current_label().unwrap());
// println!("Printer: {:?}", printer.get_status().unwrap());

#[derive(Debug, Deserialize)]
pub struct PrinterConfig {
    ipp_urls: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct PrintersInfo {
    printers: Vec<PrinterInfo>,
}

#[derive(Debug, Deserialize, Serialize, Object)]
pub struct PrinterInfo {
    name: String,
    metadata: HashMap<String, String>,
}

pub struct Printers {
    printers: Vec<Printer>,
}

impl Printers {
    pub async fn load() -> Self {
        let mut printers = Vec::new();

        let ipp_urls = envy::from_env::<PrinterConfig>().ok();

        if let Some(ipp_urls) = ipp_urls {
            for ipp_url in ipp_urls.ipp_urls {
                let printer = Printer::new(ipp_url).await;

                printers.push(printer);
            }
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
    uri: String,
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
