ALTER TABLE "ApiKey" ALTER COLUMN "userId" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "Chat" ALTER COLUMN "userId" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "Document" ALTER COLUMN "userId" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "Suggestion" ALTER COLUMN "userId" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "User" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "User" DROP COLUMN "password";
EXCEPTION
    WHEN undefined_column THEN NULL;
END $$;