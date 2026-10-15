-- Run ONCE before `npm run db:push` when upgrading from the old schema
-- (Project.skillId) to many-to-many. Copies existing project->skill links
-- into the join table Prisma expects. Safe to re-run.
CREATE TABLE IF NOT EXISTS "_ProjectToSkill" (
  "A" INTEGER NOT NULL,
  "B" INTEGER NOT NULL,
  CONSTRAINT "_ProjectToSkill_AB_pkey" PRIMARY KEY ("A", "B")
);
CREATE INDEX IF NOT EXISTS "_ProjectToSkill_B_index" ON "_ProjectToSkill"("B");
DO $$ BEGIN
  ALTER TABLE "_ProjectToSkill" ADD CONSTRAINT "_ProjectToSkill_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "_ProjectToSkill" ADD CONSTRAINT "_ProjectToSkill_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
INSERT INTO "_ProjectToSkill" ("A", "B")
  SELECT "id", "skillId" FROM "Project" WHERE "skillId" IS NOT NULL
  ON CONFLICT DO NOTHING;
