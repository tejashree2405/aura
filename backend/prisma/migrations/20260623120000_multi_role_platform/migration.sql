-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SALON', 'ADMIN');

-- CreateEnum
CREATE TYPE "SalonStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISABLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterEnum: AppointmentStatus
-- Current values: UPCOMING, COMPLETED, CANCELLED
-- Target values: PENDING, CONFIRMED, REJECTED, COMPLETED, CANCELLED
CREATE TYPE "AppointmentStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus_new"
USING (CASE
  WHEN "status"::text = 'UPCOMING' THEN 'CONFIRMED'
  ELSE "status"::text
END)::"AppointmentStatus_new";
DROP TYPE "AppointmentStatus";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable: User — add role
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable: Appointment — add new fields
ALTER TABLE "Appointment" ADD COLUMN "startTime" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "endTime" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "notes" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'PAY_AT_SALON';

-- AlterTable: Order — add status and tracking
ALTER TABLE "Order" ADD COLUMN "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_salonId_idx" ON "Appointment"("salonId");

-- CreateTable: Salon
CREATE TABLE "Salon" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT 'Bangalore',
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timings" TEXT NOT NULL DEFAULT '10:00-21:00',
    "coverImage" TEXT,
    "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "instagram" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startingPrice" INTEGER NOT NULL DEFAULT 0,
    "status" "SalonStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Salon_userId_key" ON "Salon"("userId");
CREATE UNIQUE INDEX "Salon_slug_key" ON "Salon"("slug");
CREATE INDEX "Salon_status_idx" ON "Salon"("status");
CREATE INDEX "Salon_city_idx" ON "Salon"("city");

ALTER TABLE "Salon" ADD CONSTRAINT "Salon_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "image" TEXT NOT NULL,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateTable: JournalArticle
CREATE TABLE "JournalArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "readingTime" TEXT NOT NULL DEFAULT '5 min',
    "content" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author" TEXT NOT NULL DEFAULT 'Aûra Editorial',
    "date" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JournalArticle_slug_key" ON "JournalArticle"("slug");
