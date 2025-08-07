-- Migration: 003_seed_data.sql
-- Description: Seed data for testing and development
-- Created: 2024-01-01

-- Insert sample listings (these will be visible to all users)
-- Note: These are sample listings without user_id for public viewing

INSERT INTO listings (cropType, quantity, unit, location, price, contact, description, datePosted, status) VALUES
('maize', '1000', 'kg', 'Lomé', '250000', '+228 90 12 34 56', 'Maïs de qualité supérieure, récolté récemment. Disponible pour vente immédiate.', NOW() - INTERVAL '2 days', 'active'),
('cassava', '500', 'kg', 'Kpalimé', '150000', '+228 91 23 45 67', 'Manioc frais et de bonne qualité. Idéal pour la transformation.', NOW() - INTERVAL '1 day', 'active'),
('yam', '200', 'kg', 'Atakpamé', '120000', '+228 92 34 56 78', 'Igname de qualité premium. Récolte de saison.', NOW() - INTERVAL '3 days', 'active'),
('cotton', '300', 'kg', 'Sokodé', '180000', '+228 93 45 67 89', 'Coton de qualité textile. Disponible en grande quantité.', NOW() - INTERVAL '4 days', 'active'),
('coffee', '100', 'kg', 'Kara', '300000', '+228 94 56 78 90', 'Café arabica de montagne. Torréfaction artisanale.', NOW() - INTERVAL '5 days', 'active'),
('cocoa', '150', 'kg', 'Dapaong', '250000', '+228 95 67 89 01', 'Cacao fin de qualité. Idéal pour la chocolaterie.', NOW() - INTERVAL '1 day', 'active'),
('rice', '800', 'kg', 'Tsévié', '200000', '+228 96 78 90 12', 'Riz local de qualité. Disponible en sacs de 50kg.', NOW() - INTERVAL '2 days', 'active'),
('beans', '400', 'kg', 'Aného', '160000', '+228 97 89 01 23', 'Haricots frais et nutritifs. Récolte récente.', NOW() - INTERVAL '3 days', 'active');

-- Create a function to get sample listings for development
CREATE OR REPLACE FUNCTION get_sample_listings()
RETURNS TABLE (
  id UUID,
  cropType TEXT,
  quantity TEXT,
  unit TEXT,
  location TEXT,
  price TEXT,
  contact TEXT,
  description TEXT,
  datePosted TIMESTAMP WITH TIME ZONE,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.cropType,
    l.quantity,
    l.unit,
    l.location,
    l.price,
    l.contact,
    l.description,
    l.datePosted,
    l.status
  FROM listings l
  WHERE l.user_id IS NULL  -- Only sample data
  ORDER BY l.datePosted DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get crop statistics
CREATE OR REPLACE FUNCTION get_crop_statistics()
RETURNS TABLE (
  cropType TEXT,
  total_listings BIGINT,
  avg_price NUMERIC,
  locations TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.cropType,
    COUNT(*) as total_listings,
    AVG(CAST(REPLACE(l.price, ' ', '') AS NUMERIC)) as avg_price,
    ARRAY_AGG(DISTINCT l.location) as locations
  FROM listings l
  WHERE l.status = 'active'
  GROUP BY l.cropType
  ORDER BY total_listings DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 