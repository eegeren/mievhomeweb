ALTER TABLE "User"
ADD COLUMN "defaultDeliveryAddress" TEXT,
ADD COLUMN "defaultBillingAddress" TEXT,
ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "smsNotifications" BOOLEAN NOT NULL DEFAULT false;
