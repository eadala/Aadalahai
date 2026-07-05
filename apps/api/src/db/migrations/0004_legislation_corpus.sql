CREATE TABLE IF NOT EXISTS "legislation_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(128) NOT NULL,
	"jurisdiction" varchar(64) NOT NULL DEFAULT 'السعودية',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legislation_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legislation_id" uuid NOT NULL,
	"article_ref" varchar(64) NOT NULL,
	"content" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"embedding" vector(384) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "legislation_chunks" ADD CONSTRAINT "legislation_chunks_legislation_id_legislation_sources_id_fk" FOREIGN KEY ("legislation_id") REFERENCES "public"."legislation_sources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legislation_chunks_legislation_id_idx" ON "legislation_chunks" USING btree ("legislation_id");
