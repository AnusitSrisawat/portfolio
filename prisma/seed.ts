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
    const lang = await db.category.create({ data: { name: "Languages", position: 0 } });
    const fe = await db.category.create({ data: { name: "Frontend", position: 1 } });
    await db.skill.create({
      data: {
        name: "JavaScript", categoryId: lang.id, position: 0,
        description: "Frontend and scripting.", tags: ["ES6+", "Node.js"],
      },
    });
    const react = await db.skill.create({
      data: { name: "React", categoryId: fe.id, position: 0, description: "Component-based UIs.", tags: ["Next.js", "Tailwind"] },
    });
    const js = await db.skill.findFirstOrThrow({ where: { name: "JavaScript" } });
    await db.project.create({
      data: {
        title: "Example project", url: "https://github.com/", note: "Replace me",
        skills: { connect: [{ id: js.id }, { id: react.id }] },
      },
    });
  }
}
main().finally(() => db.$disconnect());
