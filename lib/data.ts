import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function getProfile() {
  return (
    (await db.profile.findUnique({ where: { id: 1 } })) ??
    (await db.profile.create({ data: { id: 1 } }))
  );
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
