CREATE TABLE IF NOT EXISTS "lawyer_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"license_number" varchar(64) NOT NULL,
	"specialization" varchar(128) NOT NULL,
	"bar_association" varchar(128) NOT NULL,
	"phone" varchar(32),
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "lawyer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
