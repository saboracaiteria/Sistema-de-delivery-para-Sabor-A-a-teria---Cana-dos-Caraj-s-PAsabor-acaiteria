-- Migration: Add plan and duration columns to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'test',
ADD COLUMN IF NOT EXISTS plan_duration_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS plan_expiry_date TIMESTAMPTZ;

-- Update existing stores to have a default 30 day plan from now if they don't have one
UPDATE stores 
SET plan_expiry_date = NOW() + INTERVAL '30 days'
WHERE plan_expiry_date IS NULL;
