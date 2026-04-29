import { db } from "@/lib/db"

let compatibilityPromise: Promise<void> | null = null

export function ensureDatabaseCompatibility() {
  compatibilityPromise ??= applyDatabaseCompatibility().catch((error) => {
    compatibilityPromise = null
    throw error
  })

  return compatibilityPromise
}

async function applyDatabaseCompatibility() {
  // Temporary dev guard for databases created before the game metadata migration.
  // Prisma remains the source of truth; this only prevents stale Neon branches from
  // crashing before the migration has been applied.
  await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProviderId" TEXT`)
  await db.$executeRawUnsafe(`ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "ownerId" TEXT`)
  await db.$executeRawUnsafe(`ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "mode" TEXT NOT NULL DEFAULT 'local'`)
  await db.$executeRawUnsafe(`ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "boardSize" INTEGER NOT NULL DEFAULT 19`)
  await db.$executeRawUnsafe(`ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "komi" DOUBLE PRECISION NOT NULL DEFAULT 6.5`)
  await db.$executeRawUnsafe(`ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "ruleset" TEXT NOT NULL DEFAULT 'japanese'`)
  await db.$executeRawUnsafe(`ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "resultReason" TEXT`)
  await db.$executeRawUnsafe(`ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "winner" TEXT`)

  await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_authProviderId_key" ON "User"("authProviderId")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Game_ownerId_startedAt_idx" ON "Game"("ownerId", "startedAt")`)
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Game_mode_startedAt_idx" ON "Game"("mode", "startedAt")`)

  await db.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Game_ownerId_fkey'
      ) THEN
        ALTER TABLE "Game"
        ADD CONSTRAINT "Game_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `)
}
