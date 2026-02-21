CREATE TABLE `user_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` text NOT NULL,
	`apiKey` varchar(255) NOT NULL,
	`testApiKey` varchar(255) NOT NULL,
	`provider` varchar(64) NOT NULL DEFAULT 'email',
	`version` int NOT NULL DEFAULT 1,
	`tier` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_accounts_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_accounts_apiKey_unique` UNIQUE(`apiKey`),
	CONSTRAINT `user_accounts_testApiKey_unique` UNIQUE(`testApiKey`)
);
