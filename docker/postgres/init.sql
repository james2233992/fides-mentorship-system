-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant all privileges to the fides_user
GRANT ALL PRIVILEGES ON DATABASE fides_db TO fides_user;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION fides_user;

-- Set search path
SET search_path TO public;

-- Initial setup complete
-- Prisma will handle the rest of the schema creation