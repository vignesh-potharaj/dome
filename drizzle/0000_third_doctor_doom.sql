CREATE TABLE "bookings" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"branch_id" varchar(50) NOT NULL,
	"customer_id" uuid NOT NULL,
	"date" date NOT NULL,
	"slot" varchar(50) NOT NULL,
	"package_name" varchar(50) NOT NULL,
	"balloon_color" varchar(50),
	"cake_option" varchar(100),
	"sparklers" boolean DEFAULT false NOT NULL,
	"add_ons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"celebrant_name" varchar(100),
	"special_note" varchar(500),
	"guest_count" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending_payment' NOT NULL,
	"total_price" integer NOT NULL,
	"advance_paid" integer NOT NULL,
	"razorpay_order_id" varchar(100),
	"razorpay_payment_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"capacity" integer DEFAULT 6 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(100),
	"occasions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "otp_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;