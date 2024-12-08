-- Remove foreign key constraints from item_media and product_media
ALTER TABLE item_media
DROP CONSTRAINT fk_item_media_item_id;

ALTER TABLE product_media
DROP CONSTRAINT fk_product_media_product_id;
