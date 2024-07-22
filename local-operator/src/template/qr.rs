use image::{GenericImage, Luma};
use printpdf::{BuiltinFont, Image, ImageTransform, ImageXObject, Mm, PdfDocument, Px};
use qrcode::QrCode;
use std::fs::File;
use std::io::BufWriter;

pub fn generate_qr_code(data: &str) -> ImageXObject {
    let code = QrCode::new(data).unwrap();
    let image = code.render::<Luma<u8>>().build();

    // Convert image::ImageBuffer to printpdf::image::DynamicImage
    let (width, height) = image.dimensions();
    let mut buffer = image.into_raw();

    ImageXObject {
        width: Px(width as usize),
        height: Px(height as usize),
        bits_per_component: printpdf::ColorBits::Bit8,
        color_space: printpdf::ColorSpace::Greyscale,
        interpolate: false,
        image_data: buffer,
        clipping_bbox: None,
        image_filter: None,
        smask: None,
    }
}
