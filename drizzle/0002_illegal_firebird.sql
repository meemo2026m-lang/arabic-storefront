CREATE TABLE `erpPermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(120) NOT NULL,
	`module` varchar(80) NOT NULL,
	`label` varchar(180) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `erpPermissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `erpPermissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `erpRolePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `erpRolePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `erpRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`code` varchar(80) NOT NULL,
	`description` text,
	`isSystem` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `erpRoles_id` PRIMARY KEY(`id`),
	CONSTRAINT `erpRoles_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `erpUserPermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`permissionId` int NOT NULL,
	`isAllowed` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `erpUserPermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `erpUserRoles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `erpUserRoles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `erpRolePermissions` ADD CONSTRAINT `erpRolePermissions_roleId_erpRoles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `erpRoles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `erpRolePermissions` ADD CONSTRAINT `erpRolePermissions_permissionId_erpPermissions_id_fk` FOREIGN KEY (`permissionId`) REFERENCES `erpPermissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `erpUserPermissions` ADD CONSTRAINT `erpUserPermissions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `erpUserPermissions` ADD CONSTRAINT `erpUserPermissions_permissionId_erpPermissions_id_fk` FOREIGN KEY (`permissionId`) REFERENCES `erpPermissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `erpUserRoles` ADD CONSTRAINT `erpUserRoles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `erpUserRoles` ADD CONSTRAINT `erpUserRoles_roleId_erpRoles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `erpRoles`(`id`) ON DELETE no action ON UPDATE no action;