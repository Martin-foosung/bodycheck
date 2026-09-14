-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bodyPath" JSONB NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "intensity" INTEGER,
    "onset" TEXT,
    "duration" TEXT,
    "trend" TEXT,
    "answers" JSONB,
    "riskLevel" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteHospital" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ykiho" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteHospital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "HealthRecord_userId_createdAt_idx" ON "HealthRecord"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteHospital_userId_ykiho_key" ON "FavoriteHospital"("userId", "ykiho");

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteHospital" ADD CONSTRAINT "FavoriteHospital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
