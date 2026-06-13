-- Custom SQL migration file, put your code below! --
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookings_branch_isolation_policy ON "bookings"
  FOR ALL
  USING (
    branch_id = current_setting('app.current_branch_id', true)
  );