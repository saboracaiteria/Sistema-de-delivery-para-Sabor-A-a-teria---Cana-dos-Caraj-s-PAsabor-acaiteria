-- =====================================================
-- VISITORS COUNTER SETUP
-- =====================================================

-- 1. Create table for daily visitors
CREATE TABLE IF NOT EXISTS daily_visitors (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE daily_visitors ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow anyone to read visitor stats (for the panel)
CREATE POLICY "Public read visitors" ON daily_visitors FOR SELECT USING (true);

-- Allow anyone to update/insert? 
-- Ideally only backend should do this, but for this app architecture (client-heavy),
-- we often use stored procedures or public access.
-- Let's use a stored procedure to be safe and atomic.

-- 4. Stored Procedure to Increment Visitor Count
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS void AS $$
BEGIN
  INSERT INTO daily_visitors (date, count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date)
  DO UPDATE SET 
    count = daily_visitors.count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Grant execute permission to public/anon
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO anon;
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO service_role;

-- 6. Grant select on table
GRANT SELECT ON daily_visitors TO anon;
GRANT SELECT ON daily_visitors TO authenticated;
GRANT SELECT ON daily_visitors TO service_role;
