-- Custom SQL migration file, put your code below! --

-- 1. Modify bookings policy to support super_admin bypass
DROP POLICY IF EXISTS bookings_branch_isolation_policy ON "bookings";
CREATE POLICY bookings_branch_isolation_policy ON "bookings"
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'super_admin'
    OR branch_id = current_setting('app.current_branch_id', true)
  );

-- 2. Modify blocked_dates policy to support super_admin bypass
DROP POLICY IF EXISTS blocked_dates_branch_isolation_policy ON "blocked_dates";
CREATE POLICY blocked_dates_branch_isolation_policy ON "blocked_dates"
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'super_admin'
    OR branch_id = current_setting('app.current_branch_id', true)
  );

-- 3. Enable RLS and create policy for admins
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admins" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admins_branch_isolation_policy ON "admins";
CREATE POLICY admins_branch_isolation_policy ON "admins"
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'super_admin'
    OR branch_id = current_setting('app.current_branch_id', true)
  );

-- 4. Enable RLS and create policy for customers
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customers_branch_isolation_policy ON "customers";
CREATE POLICY customers_branch_isolation_policy ON "customers"
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'super_admin'
    OR EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.customer_id = customers.id
        AND bookings.branch_id = current_setting('app.current_branch_id', true)
    )
  );

-- 5. Enable RLS and create policy for booking_logs
ALTER TABLE "booking_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "booking_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS booking_logs_branch_isolation_policy ON "booking_logs";
CREATE POLICY booking_logs_branch_isolation_policy ON "booking_logs"
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'super_admin'
    OR EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_logs.booking_id
        AND bookings.branch_id = current_setting('app.current_branch_id', true)
    )
  );

-- 6. Enable RLS and create policy for communication_logs
ALTER TABLE "communication_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "communication_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS communication_logs_branch_isolation_policy ON "communication_logs";
CREATE POLICY communication_logs_branch_isolation_policy ON "communication_logs"
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'super_admin'
    OR EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = communication_logs.booking_id
        AND bookings.branch_id = current_setting('app.current_branch_id', true)
    )
  );
