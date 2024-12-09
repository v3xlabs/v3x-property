
ALTER TABLE field_definitions ADD COLUMN description TEXT;
ALTER TABLE field_definitions ADD COLUMN placeholder TEXT;

--- Introduce the description field, upc field, ean field, and sku field
INSERT INTO field_definitions (definition_id, kind, name, description, placeholder) VALUES
('vendor_id', 'text', 'Vendor ID', 'A unique identifier for the vendor', 'hitachi'),
('description', 'text', 'Description', 'A description of the field', 'This is a product description'),
('upc', 'text', 'Universal Product Code', 'A unique identifier for the product', '070847012474'),
('ean', 'text', 'European Article Number', 'A unique identifier for the product', '0070847012474'),
('gtin', 'text', 'Global Trade Item Number', 'A unique identifier for the product', '05060947543096'),
('asin', 'text', 'Amazon Standard Identification Number', 'A unique identifier for the product', 'B009XGR1WW'),
('model', 'text', 'Model Number', 'A unique identifier for the product', 'A12345');
