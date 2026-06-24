-- AlterTable: Address — add label, fullName, phone, landmark
ALTER TABLE "Address" ADD COLUMN "label" TEXT NOT NULL DEFAULT 'Home';
ALTER TABLE "Address" ADD COLUMN "fullName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Address" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Address" ADD COLUMN "landmark" TEXT;

-- AlterTable: Salon — add fulfillmentAddress
ALTER TABLE "Salon" ADD COLUMN "fulfillmentAddress" TEXT NOT NULL DEFAULT '';
