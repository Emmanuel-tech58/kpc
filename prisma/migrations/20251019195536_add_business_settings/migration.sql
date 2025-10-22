-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "businessName" TEXT,
    "businessType" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MWK',
    "taxId" TEXT,
    "enableVat" BOOLEAN NOT NULL DEFAULT false,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 16.5,
    "vatNumber" TEXT,
    "includeOperatingExpenses" BOOLEAN NOT NULL DEFAULT false,
    "trackPurchaseOrders" BOOLEAN NOT NULL DEFAULT true,
    "multiCurrency" BOOLEAN NOT NULL DEFAULT false,
    "fiscalYearStart" TEXT NOT NULL DEFAULT 'january',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_userId_key" ON "business_settings"("userId");

-- AddForeignKey
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
