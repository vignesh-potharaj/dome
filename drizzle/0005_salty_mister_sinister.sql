CREATE TABLE "blocked_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" varchar(50) NOT NULL,
	"date" date NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "blocked_dates" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "blocked_dates" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY blocked_dates_branch_isolation_policy ON "blocked_dates"
  FOR ALL
  USING (
    branch_id = current_setting('app.current_branch_id', true)
  );