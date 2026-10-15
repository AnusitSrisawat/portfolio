"use server";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { safeUrl, str } from "@/lib/validate";

async function requireAdmin() {
  const s = await auth();
  if (!s?.user) throw new Error("Unauthorized");
}

const refresh = () => {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
};

export async function loginAction() {
  await signIn("github", { redirectTo: "/admin" });
}
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function saveProfile(fd: FormData) {
  await requireAdmin();
  const data = {
    name: str(fd, "name", 80),
    role: str(fd, "role", 120),
    headline: str(fd, "headline", 40),
    bio: str(fd, "bio", 400),
    about: str(fd, "about", 2000),
    avatarUrl: safeUrl(str(fd, "avatarUrl")) ?? "",
    github: safeUrl(str(fd, "github")) ?? "",
    linkedin: safeUrl(str(fd, "linkedin")) ?? "",
    email: str(fd, "email", 120),
  };
  await db.profile.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  refresh();
}

const parseTags = (s: string) =>
  s.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8);

const catId = (fd: FormData) => {
  const n = Number(fd.get("categoryId"));
  return Number.isInteger(n) && n > 0 ? n : null;
};

async function reorder<T extends { id: number }>(
  items: T[],
  id: number,
  dir: number,
  save: (item: T, position: number) => ReturnType<typeof db.skill.update> | ReturnType<typeof db.category.update>,
) {
  const i = items.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= items.length) return;
  [items[i], items[j]] = [items[j], items[i]];
  await db.$transaction(items.map((x, idx) => save(x, idx)) as never);
}

export async function addCategory(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name", 60);
  if (!name) return;
  const last = await db.category.findFirst({ orderBy: { position: "desc" } });
  await db.category.create({ data: { name, position: (last?.position ?? -1) + 1 } });
  refresh();
}

export async function renameCategory(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const name = str(fd, "name", 60);
  if (!id || !name) return;
  await db.category.update({ where: { id }, data: { name } });
  refresh();
}

// Skills in the category are kept and shown under "Other".
export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  await db.category.delete({ where: { id: Number(fd.get("id")) } });
  refresh();
}

export async function moveCategory(fd: FormData) {
  await requireAdmin();
  const all = await db.category.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  await reorder(all, Number(fd.get("id")), fd.get("dir") === "up" ? -1 : 1, (c, position) =>
    db.category.update({ where: { id: c.id }, data: { position } }),
  );
  refresh();
}

export async function addSkill(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name", 60);
  if (!name) return;
  const categoryId = catId(fd);
  const last = await db.skill.findFirst({ where: { categoryId }, orderBy: { position: "desc" } });
  await db.skill.create({ data: { name, categoryId, position: (last?.position ?? -1) + 1 } });
  refresh();
}

export async function updateSkill(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const name = str(fd, "name", 60);
  if (!id || !name) return;
  const categoryId = catId(fd);
  const cur = await db.skill.findUnique({ where: { id } });
  if (!cur) return;
  // Moving to another category: put it at the end of that category.
  let position = cur.position;
  if (cur.categoryId !== categoryId) {
    const last = await db.skill.findFirst({ where: { categoryId }, orderBy: { position: "desc" } });
    position = (last?.position ?? -1) + 1;
  }
  const projectIds = await projectIdsInOrder(fd);
  await db.$transaction([
    db.skill.update({
      where: { id },
      data: { name, categoryId, position, description: str(fd, "description", 600) },
    }),
    db.skillProject.deleteMany({ where: { skillId: id } }),
    db.skillProject.createMany({
      data: projectIds.map((projectId, i) => ({ skillId: id, projectId, position: i })),
    }),
  ]);
  refresh();
}

export async function deleteSkill(fd: FormData) {
  await requireAdmin();
  await db.skill.delete({ where: { id: Number(fd.get("id")) } });
  refresh();
}

export type Layout = { categoryId: number | null; skillIds: number[] }[];

// Persist drag-and-drop: every skill's category and position in one transaction.
export async function saveLayout(layout: Layout) {
  await requireAdmin();
  const cats = new Set((await db.category.findMany({ select: { id: true } })).map((c) => c.id));
  const skills = new Set((await db.skill.findMany({ select: { id: true } })).map((s) => s.id));
  const seen = new Set<number>();
  const ops = [];
  for (const col of layout) {
    if (col.categoryId !== null && !cats.has(col.categoryId)) continue;
    let pos = 0;
    for (const id of col.skillIds) {
      if (!skills.has(id) || seen.has(id)) continue;
      seen.add(id);
      ops.push(db.skill.update({ where: { id }, data: { categoryId: col.categoryId, position: pos++ } }));
    }
  }
  if (ops.length) await db.$transaction(ops);
  refresh();
}

// Ordered, de-duplicated ids of existing projects (ignores tampered/stale ids).
async function projectIdsInOrder(fd: FormData) {
  const raw = fd.getAll("projectIds").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  const found = new Set(
    (await db.project.findMany({ where: { id: { in: raw } }, select: { id: true } })).map((p) => p.id),
  );
  return [...new Set(raw)].filter((id) => found.has(id));
}

export async function addProject(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title", 100);
  const url = safeUrl(str(fd, "url", 500));
  const description = str(fd, "description", 1000);
  if (!title || !url || !description) return;
  await db.project.create({
    data: { title, url, description, tags: parseTags(str(fd, "tags", 300)) },
  });
  refresh();
}

export async function updateProject(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const title = str(fd, "title", 100);
  const url = safeUrl(str(fd, "url", 500));
  const description = str(fd, "description", 1000);
  if (!id || !title || !url || !description) return;
  await db.project.update({
    where: { id },
    data: { title, url, description, tags: parseTags(str(fd, "tags", 300)) },
  });
  refresh();
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  await db.project.delete({ where: { id: Number(fd.get("id")) } });
  refresh();
}
