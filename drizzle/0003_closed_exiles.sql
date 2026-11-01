CREATE TABLE `offer_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`plan` text NOT NULL,
	`paypal` text,
	`capture` text,
	`status` text NOT NULL,
	`receipt` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `offer_orders_paypal_unique` ON `offer_orders` (`paypal`);--> statement-breakpoint
CREATE UNIQUE INDEX `offer_orders_capture_unique` ON `offer_orders` (`capture`);--> statement-breakpoint
CREATE UNIQUE INDEX `offer_orders_receipt_unique` ON `offer_orders` (`receipt`);--> statement-breakpoint
CREATE INDEX `idx_offer_orders_project` ON `offer_orders` (`project`);