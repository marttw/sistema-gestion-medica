-- CreateTable
CREATE TABLE "patient" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "healthInsurance" TEXT,
    "insuranceNumber" TEXT,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_doctorId_lastName_firstName_idx" ON "patient"("doctorId", "lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "patient_doctorId_documentNumber_key" ON "patient"("doctorId", "documentNumber");

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
