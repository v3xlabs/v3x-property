-- Add down migration script here
ALTER TABLE field_definitions DROP COLUMN description;
ALTER TABLE field_definitions DROP COLUMN placeholder;

DELETE FROM field_definitions WHERE definition_id IN ('vendor_id', 'description', 'upc', 'ean', 'gtin', 'asin', 'model');
