-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GK', 'DEF', 'MID', 'FWD');

-- CreateEnum
CREATE TYPE "SquadStatus" AS ENUM ('CONFIRMED', 'PRELIMINARY', 'TBD');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" "Position" NOT NULL,
    "shirtNumber" INTEGER,
    "club" TEXT,
    "age" INTEGER,
    "caps" INTEGER,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "squadStatus" "SquadStatus" NOT NULL DEFAULT 'TBD',
    "sortIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_teamId_sortIndex_key" ON "Player"("teamId", "sortIndex");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
