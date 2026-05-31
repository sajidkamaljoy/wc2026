-- CreateTable
CREATE TABLE "BracketPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupPicks" JSONB NOT NULL,
    "thirdPlaces" JSONB NOT NULL,
    "knockoutPicks" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BracketPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BracketPrediction_userId_key" ON "BracketPrediction"("userId");

-- AddForeignKey
ALTER TABLE "BracketPrediction" ADD CONSTRAINT "BracketPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
