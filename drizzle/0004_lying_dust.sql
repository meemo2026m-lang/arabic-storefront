CREATE TABLE `attendanceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`checkInAt` timestamp,
	`checkOutAt` timestamp,
	`notes` varchar(300),
	CONSTRAINT `attendanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `branches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`code` varchar(48) NOT NULL,
	`color` varchar(24) NOT NULL DEFAULT '#214696',
	`logoUrl` varchar(500),
	`address` text,
	`phone` varchar(40),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `branches_id` PRIMARY KEY(`id`),
	CONSTRAINT `branches_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `businessSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(180) NOT NULL,
	`logoUrl` varchar(500),
	`address` text,
	`taxNumber` varchar(80),
	`vatEnabled` int NOT NULL DEFAULT 0,
	`vatRateBps` int NOT NULL DEFAULT 1400,
	`defaultInvoicePayment` enum('cash','credit') NOT NULL DEFAULT 'cash',
	`invoiceHeader` text,
	`invoiceFooter` text,
	`returnTerms` text,
	`receiptPromoText` varchar(300),
	`receiptPromoUrl` varchar(500),
	`receiptFormat` enum('58mm','80mm','a4') NOT NULL DEFAULT '80mm',
	`theme` enum('light','dark','navy') NOT NULL DEFAULT 'navy',
	`fontFamily` varchar(80) NOT NULL DEFAULT 'Cairo',
	`loyaltyEnabled` int NOT NULL DEFAULT 0,
	`loyaltyPointValueCents` int NOT NULL DEFAULT 5,
	`loyaltyMinimumPoints` int NOT NULL DEFAULT 100,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businessSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`type` enum('cashbox','bank','wallet','network') NOT NULL,
	`openingBalance` int NOT NULL DEFAULT 0,
	`currentBalance` int NOT NULL DEFAULT 0,
	`details` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashTransfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`fromCashAccountId` int NOT NULL,
	`toCashAccountId` int NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(300),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashTransfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashierShifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`userId` int NOT NULL,
	`cashAccountId` int NOT NULL,
	`openingCash` int NOT NULL DEFAULT 0,
	`closingCash` int,
	`status` enum('open','closed') NOT NULL DEFAULT 'open',
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	CONSTRAINT `cashierShifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`type` enum('individual','company','institution') NOT NULL DEFAULT 'individual',
	`name` varchar(180) NOT NULL,
	`phone` varchar(40),
	`email` varchar(320),
	`taxNumber` varchar(80),
	`address` text,
	`city` varchar(100),
	`openingBalance` int NOT NULL DEFAULT 0,
	`creditLimit` int NOT NULL DEFAULT 0,
	`notes` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeeAdjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`type` enum('bonus','deduction') NOT NULL,
	`amount` int NOT NULL,
	`reason` varchar(300),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employeeAdjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`userId` int,
	`name` varchar(180) NOT NULL,
	`jobTitle` varchar(160),
	`phone` varchar(40),
	`nationalId` varchar(80),
	`baseSalary` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installmentPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`dueAt` timestamp NOT NULL,
	`amount` int NOT NULL,
	`paidAmount` int NOT NULL DEFAULT 0,
	`paidAt` timestamp,
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
	CONSTRAINT `installmentPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installmentPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`customerId` int NOT NULL,
	`invoiceId` int,
	`totalAmount` int NOT NULL,
	`status` enum('active','settled','overdue','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `installmentPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryBalances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`averageCost` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryBalances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`productId` int NOT NULL,
	`type` enum('opening','purchase','sale','sale_return','purchase_return','transfer_out','transfer_in','adjustment','damage') NOT NULL,
	`quantityDelta` int NOT NULL,
	`unitCost` int NOT NULL DEFAULT 0,
	`referenceType` varchar(48),
	`referenceId` int,
	`notes` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoicePayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`cashAccountId` int,
	`method` enum('cash','network','wallet','bank','credit') NOT NULL,
	`amount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoicePayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`invoiceId` int,
	`type` enum('earn','redeem','adjustment') NOT NULL,
	`points` int NOT NULL,
	`notes` varchar(300),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyaltyTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productDetails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`sku` varchar(80) NOT NULL,
	`barcode` varchar(96),
	`unit` varchar(40) NOT NULL DEFAULT 'قطعة',
	`purchasePrice` int NOT NULL DEFAULT 0,
	`wholesalePrice` int,
	`commissionType` enum('none','fixed','percent') NOT NULL DEFAULT 'none',
	`commissionValue` int NOT NULL DEFAULT 0,
	`minimumStock` int NOT NULL DEFAULT 0,
	`expiryDate` timestamp,
	`productionDate` timestamp,
	`receiptDescription` varchar(300),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productDetails_id` PRIMARY KEY(`id`),
	CONSTRAINT `productDetails_productId_unique` UNIQUE(`productId`),
	CONSTRAINT `productDetails_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `productDetails_barcode_unique` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE TABLE `purchaseInvoiceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseInvoiceId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitCost` int NOT NULL,
	`lineTotal` int NOT NULL,
	CONSTRAINT `purchaseInvoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`supplierId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`invoiceNumber` varchar(80) NOT NULL,
	`paymentMethod` enum('cash','bank','wallet','credit') NOT NULL DEFAULT 'credit',
	`cashAccountId` int,
	`subtotal` int NOT NULL DEFAULT 0,
	`discountTotal` int NOT NULL DEFAULT 0,
	`vatTotal` int NOT NULL DEFAULT 0,
	`freightTotal` int NOT NULL DEFAULT 0,
	`grandTotal` int NOT NULL DEFAULT 0,
	`amountPaid` int NOT NULL DEFAULT 0,
	`amountDue` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchaseInvoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `salesInvoiceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`unitCost` int NOT NULL DEFAULT 0,
	`discountTotal` int NOT NULL DEFAULT 0,
	`vatTotal` int NOT NULL DEFAULT 0,
	`lineTotal` int NOT NULL,
	CONSTRAINT `salesInvoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`customerId` int,
	`cashierUserId` int NOT NULL,
	`shiftId` int,
	`invoiceNumber` varchar(80) NOT NULL,
	`status` enum('draft','issued','voided','partially_returned','returned') NOT NULL DEFAULT 'issued',
	`subtotal` int NOT NULL DEFAULT 0,
	`discountTotal` int NOT NULL DEFAULT 0,
	`vatTotal` int NOT NULL DEFAULT 0,
	`grandTotal` int NOT NULL DEFAULT 0,
	`amountPaid` int NOT NULL DEFAULT 0,
	`amountDue` int NOT NULL DEFAULT 0,
	`notes` text,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `salesInvoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `salesReturnItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`returnId` int NOT NULL,
	`invoiceItemId` int NOT NULL,
	`quantity` int NOT NULL,
	`reason` varchar(160),
	`lineTotal` int NOT NULL,
	CONSTRAINT `salesReturnItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesReturns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`branchId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`refundCashAccountId` int,
	`returnNumber` varchar(80) NOT NULL,
	`reason` varchar(240),
	`total` int NOT NULL DEFAULT 0,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesReturns_id` PRIMARY KEY(`id`),
	CONSTRAINT `salesReturns_returnNumber_unique` UNIQUE(`returnNumber`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`phone` varchar(40),
	`email` varchar(320),
	`taxNumber` varchar(80),
	`contactName` varchar(160),
	`address` text,
	`city` varchar(100),
	`openingBalance` int NOT NULL DEFAULT 0,
	`creditLimit` int NOT NULL DEFAULT 0,
	`paymentTerms` varchar(180),
	`notes` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBranches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`branchId` int NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userBranches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`code` varchar(48) NOT NULL,
	`isDefault` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouses_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD CONSTRAINT `attendanceRecords_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashAccounts` ADD CONSTRAINT `cashAccounts_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashTransfers` ADD CONSTRAINT `cashTransfers_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashTransfers` ADD CONSTRAINT `cashTransfers_fromCashAccountId_cashAccounts_id_fk` FOREIGN KEY (`fromCashAccountId`) REFERENCES `cashAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashTransfers` ADD CONSTRAINT `cashTransfers_toCashAccountId_cashAccounts_id_fk` FOREIGN KEY (`toCashAccountId`) REFERENCES `cashAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashTransfers` ADD CONSTRAINT `cashTransfers_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashierShifts` ADD CONSTRAINT `cashierShifts_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashierShifts` ADD CONSTRAINT `cashierShifts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cashierShifts` ADD CONSTRAINT `cashierShifts_cashAccountId_cashAccounts_id_fk` FOREIGN KEY (`cashAccountId`) REFERENCES `cashAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customers` ADD CONSTRAINT `customers_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeeAdjustments` ADD CONSTRAINT `employeeAdjustments_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `installmentPayments` ADD CONSTRAINT `installmentPayments_planId_installmentPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `installmentPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `installmentPlans` ADD CONSTRAINT `installmentPlans_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `installmentPlans` ADD CONSTRAINT `installmentPlans_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `installmentPlans` ADD CONSTRAINT `installmentPlans_invoiceId_salesInvoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `salesInvoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryBalances` ADD CONSTRAINT `inventoryBalances_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryBalances` ADD CONSTRAINT `inventoryBalances_warehouseId_warehouses_id_fk` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryMovements` ADD CONSTRAINT `inventoryMovements_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryMovements` ADD CONSTRAINT `inventoryMovements_warehouseId_warehouses_id_fk` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryMovements` ADD CONSTRAINT `inventoryMovements_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryMovements` ADD CONSTRAINT `inventoryMovements_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoicePayments` ADD CONSTRAINT `invoicePayments_invoiceId_salesInvoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `salesInvoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoicePayments` ADD CONSTRAINT `invoicePayments_cashAccountId_cashAccounts_id_fk` FOREIGN KEY (`cashAccountId`) REFERENCES `cashAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loyaltyTransactions` ADD CONSTRAINT `loyaltyTransactions_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `loyaltyTransactions` ADD CONSTRAINT `loyaltyTransactions_invoiceId_salesInvoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `salesInvoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productDetails` ADD CONSTRAINT `productDetails_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseInvoiceItems` ADD CONSTRAINT `purchaseInvoiceItems_purchaseInvoiceId_purchaseInvoices_id_fk` FOREIGN KEY (`purchaseInvoiceId`) REFERENCES `purchaseInvoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseInvoiceItems` ADD CONSTRAINT `purchaseInvoiceItems_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD CONSTRAINT `purchaseInvoices_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD CONSTRAINT `purchaseInvoices_warehouseId_warehouses_id_fk` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD CONSTRAINT `purchaseInvoices_supplierId_suppliers_id_fk` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD CONSTRAINT `purchaseInvoices_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseInvoices` ADD CONSTRAINT `purchaseInvoices_cashAccountId_cashAccounts_id_fk` FOREIGN KEY (`cashAccountId`) REFERENCES `cashAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesInvoiceItems` ADD CONSTRAINT `salesInvoiceItems_invoiceId_salesInvoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `salesInvoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesInvoiceItems` ADD CONSTRAINT `salesInvoiceItems_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD CONSTRAINT `salesInvoices_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD CONSTRAINT `salesInvoices_warehouseId_warehouses_id_fk` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD CONSTRAINT `salesInvoices_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD CONSTRAINT `salesInvoices_cashierUserId_users_id_fk` FOREIGN KEY (`cashierUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesInvoices` ADD CONSTRAINT `salesInvoices_shiftId_cashierShifts_id_fk` FOREIGN KEY (`shiftId`) REFERENCES `cashierShifts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesReturnItems` ADD CONSTRAINT `salesReturnItems_returnId_salesReturns_id_fk` FOREIGN KEY (`returnId`) REFERENCES `salesReturns`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesReturnItems` ADD CONSTRAINT `salesReturnItems_invoiceItemId_salesInvoiceItems_id_fk` FOREIGN KEY (`invoiceItemId`) REFERENCES `salesInvoiceItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesReturns` ADD CONSTRAINT `salesReturns_invoiceId_salesInvoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `salesInvoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesReturns` ADD CONSTRAINT `salesReturns_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesReturns` ADD CONSTRAINT `salesReturns_warehouseId_warehouses_id_fk` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesReturns` ADD CONSTRAINT `salesReturns_refundCashAccountId_cashAccounts_id_fk` FOREIGN KEY (`refundCashAccountId`) REFERENCES `cashAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesReturns` ADD CONSTRAINT `salesReturns_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suppliers` ADD CONSTRAINT `suppliers_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userBranches` ADD CONSTRAINT `userBranches_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userBranches` ADD CONSTRAINT `userBranches_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warehouses` ADD CONSTRAINT `warehouses_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;