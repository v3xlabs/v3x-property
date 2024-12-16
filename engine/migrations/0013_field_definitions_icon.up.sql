-- Add up migration script here
ALTER TABLE field_definitions ADD COLUMN icon TEXT;

-- Update the existing field definitions with font awesome 6 icons in the format fa6:icon-name
UPDATE field_definitions SET icon = 'fa6:solid/user' WHERE definition_id = 'vendor_id';
UPDATE field_definitions SET icon = 'fa6:solid/note-sticky' WHERE definition_id = 'description';
UPDATE field_definitions SET icon = 'fa6:solid/barcode' WHERE definition_id = 'upc';
UPDATE field_definitions SET icon = 'fa6:solid/barcode' WHERE definition_id = 'ean';
UPDATE field_definitions SET icon = 'fa6:solid/barcode' WHERE definition_id = 'gtin';
UPDATE field_definitions SET icon = 'fa6:brands/amazon' WHERE definition_id = 'asin';
UPDATE field_definitions SET icon = 'fa6:solid/layer-group' WHERE definition_id = 'model';
