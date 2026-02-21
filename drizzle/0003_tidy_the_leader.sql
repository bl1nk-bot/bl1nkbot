CREATE TABLE `email_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`template` varchar(100) NOT NULL,
	`data` text,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`retries` int NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` int NOT NULL DEFAULT 1,
	`pushNotifications` int NOT NULL DEFAULT 1,
	`inAppNotifications` int NOT NULL DEFAULT 1,
	`workflowEvents` int NOT NULL DEFAULT 1,
	`webhookEvents` int NOT NULL DEFAULT 1,
	`userEvents` int NOT NULL DEFAULT 1,
	`systemEvents` int NOT NULL DEFAULT 1,
	`digestFrequency` enum('immediate','daily','weekly','never') NOT NULL DEFAULT 'immediate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workspaceId` int,
	`type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`actionUrl` varchar(500),
	`actionLabel` varchar(100),
	`read` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
