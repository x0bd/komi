-- Add external auth mapping for safer user sync.
ALTER TABLE "User" ADD COLUMN "authProviderId" TEXT;

-- Add game metadata needed for reliable replay, filtering, and stats.
ALTER TABLE "Game" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "Game" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "Game" ADD COLUMN "boardSize" INTEGER NOT NULL DEFAULT 19;
ALTER TABLE "Game" ADD COLUMN "komi" DOUBLE PRECISION NOT NULL DEFAULT 6.5;
ALTER TABLE "Game" ADD COLUMN "ruleset" TEXT NOT NULL DEFAULT 'japanese';
ALTER TABLE "Game" ADD COLUMN "resultReason" TEXT;
ALTER TABLE "Game" ADD COLUMN "winner" TEXT;

-- Backfill winner/reason from existing result strings where possible.
UPDATE "Game"
SET
  "winner" = CASE
    WHEN lower(coalesce("result", '')) LIKE '%draw%' THEN 'draw'
    WHEN lower(coalesce("result", '')) LIKE 'b+%' OR lower(coalesce("result", '')) LIKE '%black%' THEN 'black'
    WHEN lower(coalesce("result", '')) LIKE 'w+%' OR lower(coalesce("result", '')) LIKE '%white%' THEN 'white'
    ELSE NULL
  END,
  "resultReason" = CASE
    WHEN lower(coalesce("result", '')) LIKE '%resign%' THEN 'resignation'
    WHEN lower(coalesce("result", '')) LIKE '%time%' THEN 'timeout'
    WHEN "result" IS NOT NULL THEN 'score'
    ELSE NULL
  END;

CREATE UNIQUE INDEX "User_authProviderId_key" ON "User"("authProviderId");
CREATE INDEX "Game_ownerId_startedAt_idx" ON "Game"("ownerId", "startedAt");
CREATE INDEX "Game_mode_startedAt_idx" ON "Game"("mode", "startedAt");

ALTER TABLE "Game" ADD CONSTRAINT "Game_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
