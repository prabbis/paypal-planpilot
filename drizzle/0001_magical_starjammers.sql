CREATE TABLE `store_customers` (
	`id` text PRIMARY KEY NOT NULL,
	`store` text NOT NULL,
	`user` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_store_customer_membership` ON `store_customers` (`store`,`user`);--> statement-breakpoint
CREATE TABLE `store_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`store` text NOT NULL,
	`buyer` text,
	`email` text,
	`cart` text NOT NULL,
	`total` integer NOT NULL,
	`paypal` text,
	`capture` text,
	`status` text NOT NULL,
	`receipt` text NOT NULL,
	`shipping` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_orders_paypal_unique` ON `store_orders` (`paypal`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_orders_receipt_unique` ON `store_orders` (`receipt`);--> statement-breakpoint
CREATE INDEX `idx_store_orders_store` ON `store_orders` (`store`);--> statement-breakpoint
CREATE INDEX `idx_store_orders_buyer_store` ON `store_orders` (`buyer`,`store`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`slug` text,
	`draft` text NOT NULL,
	`published` text,
	`credentials` text,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_slug_unique` ON `stores` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_stores_owner` ON `stores` (`owner`);