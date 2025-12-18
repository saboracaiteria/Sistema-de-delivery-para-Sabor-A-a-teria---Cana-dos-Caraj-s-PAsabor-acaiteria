-- =====================================================
-- FIX VISITOR COUNTER PERMISSIONS
-- =====================================================

-- The previous version of the function failed because 'anon' user
-- does not have permission to INSERT into daily_visitors table due to RLS.
-- We verify the function uses SECURITY DEFINER to run with owner privileges.

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution again just to be sure
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO anon;
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO service_role;
