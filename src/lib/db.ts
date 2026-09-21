import { PrismaClient } from '@prisma/client'
import { resolveDatabaseUrl } from './db-path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Anchor relative SQLite URLs at the repo root (schema-dir
    // semantics) so the db file lives at <repo>/db/custom.db no
    // matter the process working directory — see src/lib/db-path.ts.
    datasourceUrl: resolveDatabaseUrl(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
