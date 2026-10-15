-- Run ONCE before `npm run db:push` when upgrading from the implicit
-- project<->skill link table ("_ProjectToSkill") to the ordered "SkillProject"
-- table. Copies existing links, numbering each skill's projects by id.
-- Safe to re-run.
CREATE TABLE IF NOT EXISTS "SkillProject" (
  "skillId" INTEGER NOT NULL,
  "projectId" INTEGER NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "SkillProject_pkey" PRIMARY KEY ("skillId", "projectId")
);
DO $$ BEGIN
  ALTER TABLE "SkillProject" ADD CONSTRAINT "SkillProject_skillId_fkey"
    FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "SkillProject" ADD CONSTRAINT "SkillProject_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  IF to_regclass('"_ProjectToSkill"') IS NOT NULL THEN
    INSERT INTO "SkillProject" ("skillId", "projectId", "position")
      SELECT "B", "A", (ROW_NUMBER() OVER (PARTITION BY "B" ORDER BY "A")) - 1
      FROM "_ProjectToSkill"
      ON CONFLICT DO NOTHING;
  END IF;
END $$;
