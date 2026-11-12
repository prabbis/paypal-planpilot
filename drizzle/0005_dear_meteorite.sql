CREATE TABLE `demo_paypal_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_demo_paypal_resources_owner` ON `demo_paypal_resources` (`owner`);