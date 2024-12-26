use ab_glyph::{Font, FontRef, PxScale, ScaleFont};
use image::{imageops, GenericImage, ImageBuffer, Rgba, RgbaImage};
use imageproc::definitions::HasBlack;
use imageproc::drawing::{self, draw_text_mut};
use qrcode::QrCode;

pub fn inner_canvas(
    id: u64,
    width: u32,
    height: u32,
    multiplier: u32,
) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
    let inner_width = height / 2;
    let inner_height = width / 2;
    let height_gap = 125 * multiplier;

    let mut inner_canvas = RgbaImage::new(inner_width, inner_height);
    // // draw a white rectangle on the inner canvas
    // let mut inner_canvas = drawing::draw_filled_rect(
    //     &inner_canvas,
    //     imageproc::rect::Rect::at(0, 0).of_size(inner_width, inner_height),
    //     Rgba([255, 255, 255, 255]),
    // );
    // let mut inner_canvas = drawing::draw_hollow_rect(
    //     &mut inner_canvas,
    //     imageproc::rect::Rect::at(0, 0).of_size(inner_width, inner_height),
    //     Rgba([0, 0, 0, 255]),
    // );

    // Generate QR Code
    let qr_code = QrCode::new(&format!("https://v3x.property/{}", id)).unwrap();
    let buffer = qr_code.render::<image::Luma<u8>>().build();
    let mut buffer = image::DynamicImage::ImageLuma8(buffer).to_rgba8();

    let buffer = imageops::resize(
        &buffer,
        180 * multiplier,
        180 * multiplier,
        imageops::FilterType::Nearest,
    );

    let qr_height = buffer.height();
    let qr_padding = (inner_height as i64 - height_gap as i64 - qr_height as i64) / 2;
    let qr_padding_x = 12 * multiplier as i64;

    imageops::overlay(
        &mut inner_canvas,
        &buffer,
        0,
        (height_gap as i64 + qr_padding).into(),
    );

    // Add text "v3x.property"
    // https://cdn.jsdelivr.net/npm/hack-font@3.3.0/build/web/fonts/hack-regular-subset.woff2

    let mut text_canvas = RgbaImage::new(inner_width, inner_height);

    let text = "v3x.property";
    let font = FontRef::try_from_slice(include_bytes!("./fonts/hack-regular-subset.ttf")).unwrap();

    let scale = PxScale::from(42.0 * multiplier as f32);
    let scaled_font = font.as_scaled(scale);
    let ascent = scaled_font.ascent();
    let descent = scaled_font.descent();
    let line_gap = scaled_font.line_gap();
    let font_height: i64 = (ascent - descent + line_gap).ceil() as i64;
    let glyph_id = scaled_font.glyph_id('0');
    let glyph = scaled_font.h_advance(glyph_id);
    let text_width = (text.len() as f32 * glyph).ceil() as i64;

    let color: Rgba<u8> = Rgba::black();
    draw_text_mut(&mut text_canvas, color, 0, 0, scale, &font, text);

    imageops::overlay(
        &mut inner_canvas,
        &text_canvas,
        qr_padding_x + qr_height as i64,
        ((inner_height - height_gap) / 2) as i64 - (font_height) + height_gap as i64,
    );

    let product_text = format!("{:010}", id);
    let product_text_scale = PxScale::from(32.0 * multiplier as f32);

    let mut text_canvas = RgbaImage::new(inner_width, inner_height);
    draw_text_mut(
        &mut text_canvas,
        color,
        0,
        0,
        product_text_scale,
        &font,
        &product_text,
    );

    imageops::overlay(
        &mut inner_canvas,
        &text_canvas,
        qr_padding_x + qr_height as i64,
        ((inner_height - height_gap) / 2) as i64 + (font_height / 4) + height_gap as i64,
    );

    // rotate inner_canvas 90 degrees clockwise
    let inner_canvas = imageops::rotate90(&inner_canvas);

    let inner_subwidth = text_width + qr_padding_x + (qr_height as i64);
    let inner_padding_x = ((inner_width as i64) - inner_subwidth) / 2;

    inner_canvas
}

pub fn generate_tag(id: u64) {
    let multiplier = 5;
    let (width, height) = (600 * multiplier, 1000 * multiplier);
    let mut canvas = RgbaImage::new(width, height);

    let c1 = inner_canvas(id, width, height, multiplier);
    let c2 = inner_canvas(id + 1, width, height, multiplier);

    imageops::overlay(&mut canvas, &c1, 0, 0);
    imageops::overlay(&mut canvas, &c2, 0, height as i64 / 2);

    // mirror the top half of the canvas horizontally and vertically and overlay it on the top half
    let top_half = canvas.sub_image(0, 0, width, height / 2).to_image();
    let mirrored_top_half = imageops::flip_vertical(&top_half);
    let mirrored_top_half = imageops::flip_horizontal(&mirrored_top_half);
    imageops::overlay(&mut canvas, &mirrored_top_half, 0, 0);
    // mirror the top half of the canvas horizontally and vertically and overlay it on the top half
    let top_half = canvas
        .sub_image(0, height / 2, width, height / 2)
        .to_image();
    let mirrored_top_half = imageops::flip_vertical(&top_half);
    let mirrored_top_half = imageops::flip_horizontal(&mirrored_top_half);
    imageops::overlay(&mut canvas, &mirrored_top_half, 0, height as i64 / 2);

    // mirror the top half of the canvas horizontally and vertically and overlay it on the bottom half
    // let mut top_half = canvas.sub_image(0, 0, width, height / 2);
    // let mut mirrored_top_half = imageops::flip_vertical(top_half.inner_mut());
    // let mirrored_top_half = imageops::flip_horizontal(&mirrored_top_half);
    // imageops::overlay(&mut canvas, &mirrored_top_half, 0, 0);

    canvas.save("output.png").unwrap();
}
