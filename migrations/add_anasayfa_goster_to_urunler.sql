-- Migration: Add anasayfa_goster column to urunler table
-- Date: 2024-10-24
-- Description: Adds a boolean column to control which products are displayed on the homepage

-- Add anasayfa_goster column if it doesn't exist
ALTER TABLE urunler
ADD COLUMN IF NOT EXISTS anasayfa_goster BOOLEAN DEFAULT false;

-- Add comment to document the column
COMMENT ON COLUMN urunler.anasayfa_goster IS 'Determines if the product should be displayed on the homepage';

-- Update existing Varmeks SILENT POOL products to show on homepage
UPDATE urunler
SET anasayfa_goster = true
WHERE id IN (
  '576c0d98-c921-48d5-b228-2f223110203a', -- VARM SILENT POOL 11 kW
  '6c6b4caf-2c41-4756-b424-ed2db5aa3384', -- VARM SILENT POOL 14 kW
  '3cdba058-66b0-4e77-969b-41a89e7597a3'  -- VARM SILENT POOL 28 kW
);
