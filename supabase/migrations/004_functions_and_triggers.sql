-- Migration: 004_functions_and_triggers.sql
-- Description: Additional database functions and triggers for enhanced functionality
-- Created: 2024-01-01

-- Function to validate phone number format (Togolese format)
CREATE OR REPLACE FUNCTION validate_phone_number(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if phone number matches Togolese format: +228 XX XX XX XX or 228 XX XX XX XX
  RETURN phone ~ '^(\+228|228)?[0-9]{8}$';
END;
$$ LANGUAGE plpgsql;

-- Function to format phone number
CREATE OR REPLACE FUNCTION format_phone_number(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove all non-digit characters
  phone := regexp_replace(phone, '[^0-9]', '', 'g');
  
  -- If it starts with 228, convert to +228 format
  IF phone ~ '^228' THEN
    phone := '+' || phone;
  ELSIF phone ~ '^[0-9]{8}$' THEN
    phone := '+228' || phone;
  END IF;
  
  RETURN phone;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's listings
CREATE OR REPLACE FUNCTION get_user_listings(user_uuid UUID)
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
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
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
    l.status,
    l.created_at
  FROM listings l
  WHERE l.user_id = user_uuid
  ORDER BY l.datePosted DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search listings
CREATE OR REPLACE FUNCTION search_listings(
  search_term TEXT DEFAULT NULL,
  crop_type_filter TEXT DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL
)
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
  WHERE l.status = 'active'
    AND (search_term IS NULL OR 
         l.cropType ILIKE '%' || search_term || '%' OR
         l.location ILIKE '%' || search_term || '%' OR
         l.description ILIKE '%' || search_term || '%')
    AND (crop_type_filter IS NULL OR l.cropType = crop_type_filter)
    AND (location_filter IS NULL OR l.location = location_filter)
    AND (min_price IS NULL OR CAST(REPLACE(l.price, ' ', '') AS NUMERIC) >= min_price)
    AND (max_price IS NULL OR CAST(REPLACE(l.price, ' ', '') AS NUMERIC) <= max_price)
  ORDER BY l.datePosted DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to validate phone number before insert/update
CREATE OR REPLACE FUNCTION validate_listing_phone()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT validate_phone_number(NEW.contact) THEN
    RAISE EXCEPTION 'Invalid phone number format. Please use Togolese format: +228 XX XX XX XX';
  END IF;
  
  -- Format the phone number
  NEW.contact := format_phone_number(NEW.contact);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for phone validation
CREATE TRIGGER validate_listing_phone_trigger
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION validate_listing_phone();

-- Trigger to validate profile phone number
CREATE OR REPLACE FUNCTION validate_profile_phone()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT validate_phone_number(NEW.phone) THEN
    RAISE EXCEPTION 'Invalid phone number format. Please use Togolese format: +228 XX XX XX XX';
  END IF;
  
  -- Format the phone number
  NEW.phone := format_phone_number(NEW.phone);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile phone validation
CREATE TRIGGER validate_profile_phone_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_phone(); 