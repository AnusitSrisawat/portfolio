import { db } from "@/lib/db";

export async function getProfile() {
  return (
    (await db.profile.findUnique({ where: { id: 1 } })) ??
    (await db.profile.create({ data: { id: 1 } }))
  );
}

export const getSkills = () =>
  db.skill.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
    include: { projects: { orderBy: { id: "asc" } } },
  });
