import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Anusit Srisawat",
      role: "Your Role",
      bio: "A short intro about what I do and what I care about.",
      about: "Tell visitors a little about yourself here.",
      email: "jimmy18778@gmail.com",
      github: "https://github.com/anusitsrisawat",
    },
  });
  if ((await db.skill.count()) === 0) {
    await db.skill.create({
      data: {
        name: "JavaScript", level: 4, position: 0,
        description: "Frontend and scripting.", tags: ["React", "Next.js"],
        projects: { create: [{ title: "Example project", url: "https://github.com/", note: "Replace me" }] },
      },
    });
    await db.skill.create({ data: { name: "UI Design", level: 3, position: 1, description: "Interfaces in Figma." } });
  }
}
main().finally(() => db.$disconnect());
