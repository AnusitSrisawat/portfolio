import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const CATEGORIES = ["Frontend", "Backend", "Database", "AI-Assisted Development", "Tools"];

// Idempotent: safe to run any number of times, never touches existing data.
async function main() {
  await db.profile.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const existing = new Set((await db.category.findMany()).map((c) => c.name));
  const last = await db.category.findFirst({ orderBy: { position: "desc" } });
  let position = (last?.position ?? -1) + 1;
  for (const name of CATEGORIES) {
    if (existing.has(name)) continue;
    await db.category.create({ data: { name, position: position++ } });
  }
}
main().finally(() => db.$disconnect());
