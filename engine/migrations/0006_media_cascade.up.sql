-- Add foreign key constraints to item_media and product_media
ALTER TABLE item_media
ADD CONSTRAINT fk_item_media_item_id
FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE;

ALTER TABLE product_media
ADD CONSTRAINT fk_product_media_product_id
FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;
