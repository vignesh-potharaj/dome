CREATE TABLE "booking_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar(50) NOT NULL,
	"admin_id" uuid,
	"action" varchar(100) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "internal_notes" varchar(1000);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "balance_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_logs" ADD CONSTRAINT "booking_logs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_logs" ADD CONSTRAINT "booking_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;