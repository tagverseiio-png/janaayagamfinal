-- CreateTable
CREATE TABLE "PincodeMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pincode" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "district" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "PincodeMapping_pincode_idx" ON "PincodeMapping"("pincode");
