CREATE TABLE `pricing_chats` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`snapshot` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_pricing_chats_owner_updated` ON `pricing_chats` (`owner`,`updated`);