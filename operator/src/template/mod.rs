use printpdf::{
    BuiltinFont, ImageTransform, Mm, PdfDocument, PdfDocumentReference, PdfLayerReference,
};

use crate::{label::Label, template::qr::generate_qr_code};

mod qr;

pub enum LabelTemplate {
    /// 60mm x 90mm
    G1QR,
    G2Small,
    G3Cable,
}

pub trait LabelPrintable {
    fn print(&self, label: &Label) -> Result<PdfDocumentReference, anyhow::Error>;
}

impl LabelPrintable for LabelTemplate {
    fn print(&self, label: &Label) -> Result<PdfDocumentReference, anyhow::Error> {
        match self {
            LabelTemplate::G1QR => {
                let (doc, layer) = create_document(60, 90);

                let text = "v3x.property";
                let text2 = format!("{:0>10}", label.id);
                let font = doc
                    .add_builtin_font(BuiltinFont::HelveticaBoldOblique)
                    .unwrap();
                let font2 = doc.add_builtin_font(BuiltinFont::Courier).unwrap();

                // Adding text to the PDF
                layer.use_text(text, 12.0, Mm(18.0), Mm(9.5), &font);
                layer.use_text(text2, 10.0, Mm(18.0), Mm(5.5), &font2);

                let url = format!("https://v3x.property/{}", label.id);

                // Adding an image to the PDF
                let qr_image = generate_qr_code(&url);
                let qr_width: f32 = 420.0;
                let qr_scale_x = qr_width / (qr_image.width.0 as f32);

                let image = printpdf::image::Image::from(qr_image);
                image.add_to_layer(
                    layer,
                    ImageTransform {
                        dpi: Some(600.0),
                        scale_x: Some(qr_scale_x),
                        scale_y: Some(qr_scale_x),
                        ..Default::default()
                    },
                );

                Ok(doc)
            }
            LabelTemplate::G2Small => {
                println!("G2Small");
                Err(anyhow::Error::msg("Not implemented"))
            }
            LabelTemplate::G3Cable => {
                println!("G3Cable");
                Err(anyhow::Error::msg("Not implemented"))
            }
        }
    }
}

fn create_document(width: i32, height: i32) -> (PdfDocumentReference, PdfLayerReference) {
    let (doc_width, doc_height) = (Mm(width as f32), Mm(height as f32));

    // Create a new PDF document
    let (doc, page1, layer1) = PdfDocument::new("PDF Document", doc_width, doc_height, "Layer 1");

    let current_layer = doc.get_page(page1).get_layer(layer1);

    (doc, current_layer)
}
