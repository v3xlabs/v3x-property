use brother_ql_rs::printer::ThermalPrinter;

fn main() {
    println!("Hello, world!");

    let devices = brother_ql_rs::printer::printers();

    if devices.is_empty() {
        println!("No devices found");
        return;
    }

    let device = devices.into_iter().next().unwrap();
    println!("Device: {:?}", device);

    let printer = ThermalPrinter::new(device).unwrap();

    println!("Printer: {:?}", printer.manufacturer);
    println!("Printer: {:?}", printer.model);
    println!("Printer: {:?}", printer.serial_number);
    println!("Printer: {:?}", printer.current_label().unwrap());
    println!("Printer: {:?}", printer.get_status().unwrap());
}
