-- CreateTable
CREATE TABLE "service_items" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionEs" TEXT NOT NULL,
    "priceUsd" INTEGER NOT NULL,
    "priceCop" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "featuresEn" TEXT[],
    "featuresEs" TEXT[],
    "imageUrl" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_items_active_idx" ON "service_items"("active");
