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

export async function addSkill(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name", 60);
  if (!name) return;
  const last = await db.skill.findFirst({ orderBy: { position: "desc" } });
  await db.skill.create({
    data: { name, position: (last?.position ?? -1) + 1 },
  });
  refresh();
}

export async function updateSkill(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const name = str(fd, "name", 60);
  if (!id || !name) return;
  await db.skill.update({
    where: { id },
    data: {
      name,
      description: str(fd, "description", 600),
      tags: parseTags(str(fd, "tags", 300)),
    },
  });
  refresh();
}

export async function deleteSkill(fd: FormData) {
  await requireAdmin();
  await db.skill.delete({ where: { id: Number(fd.get("id")) } });
  refresh();
}

export async function moveSkill(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const dir = fd.get("dir") === "up" ? -1 : 1;
  const all = await db.skill.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
  const i = all.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(
    all.map((s, idx) => db.skill.update({ where: { id: s.id }, data: { position: idx } })),
  );
  refresh();
}

export async function addProject(fd: FormData) {
  await requireAdmin();
  const skillId = Number(fd.get("skillId"));
  const title = str(fd, "title", 100);
  const url = safeUrl(str(fd, "url", 500));
  if (!skillId || !title || !url) return;
  await db.project.create({ data: { skillId, title, url, note: str(fd, "note", 200) } });
  refresh();
}

export async function updateProject(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const title = str(fd, "title", 100);
  const url = safeUrl(str(fd, "url", 500));
  if (!id || !title || !url) return;
  await db.project.update({ where: { id }, data: { title, url, note: str(fd, "note", 200) } });
  refresh();
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  await db.project.delete({ where: { id: Number(fd.get("id")) } });
  refresh();
}
