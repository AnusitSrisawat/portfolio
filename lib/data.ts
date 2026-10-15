import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { DEFAULT_COLORS } from "@/lib/theme";

export async function getProfile() {
  const p =
    (await db.profile.findUnique({ where: { id: 1 } })) ??
    (await db.profile.create({ data: { id: 1 } }));
  // Colors fall back to defaults if the columns are missing/empty (e.g. stale Prisma client or unmigrated DB).
  return {
    ...p,
    colorCream: p.colorCream || DEFAULT_COLORS.colorCream,
    colorInk: p.colorInk || DEFAULT_COLORS.colorInk,
    colorAmber: p.colorAmber || DEFAULT_COLORS.colorAmber,
    colorAmberDeep: p.colorAmberDeep || DEFAULT_COLORS.colorAmberDeep,
  };
}

export type SkillWithProjects = Prisma.SkillGetPayload<object> & {
  projects: Prisma.ProjectGetPayload<object>[]; // ordered by this skill's own ordering
};

export type Group = {
  id: number | null; // null = skills without a category
  name: string;
  skills: SkillWithProjects[];
};

// Categories in order, followed by an "Other" group for uncategorised skills.
export async function getGroups(): Promise<Group[]> {
  const [cats, rows] = await Promise.all([
    db.category.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }),
    db.skill.findMany({
      orderBy: [{ position: "asc" }, { id: "asc" }],
      include: {
        projects: { orderBy: [{ position: "asc" }, { projectId: "asc" }], include: { project: true } },
      },
    }),
  ]);
  const skills: SkillWithProjects[] = rows.map(({ projects, ...s }) => ({
    ...s,
    projects: projects.map((sp) => sp.project),
  }));
  const groups: Group[] = cats.map((c) => ({
    id: c.id,
    name: c.name,
    skills: skills.filter((s) => s.categoryId === c.id),
  }));
  const other = skills.filter((s) => s.categoryId === null);
  if (other.length) groups.push({ id: null, name: "Other", skills: other });
  return groups;
}
