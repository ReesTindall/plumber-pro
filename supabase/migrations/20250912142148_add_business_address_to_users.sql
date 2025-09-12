-- Add business_address column to users table
ALTER TABLE users ADD COLUMN business_address TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN users.business_address IS 'Primary business address for route optimization starting point';