CREATE TABLE `demo_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`expires` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demo_sessions_owner_unique` ON `demo_sessions` (`owner`);--> statement-breakpoint
CREATE INDEX `idx_demo_sessions_expires` ON `demo_sessions` (`expires`);