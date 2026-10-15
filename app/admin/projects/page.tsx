import { db } from "@/lib/db";
import { addProject, deleteProject, updateProject } from "@/lib/actions";
import { requireAdminPage } from "@/lib/session";
import { ActionForm } from "@/components/ActionForm";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  await requireAdminPage();
  const projects = await db.project.findMany({
    orderBy: { id: "desc" },
    include: { skills: { include: { skill: { select: { name: true } } } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Projects</h1>

      <ActionForm action={addProject} resetOnSuccess pendingText="Adding…" successText="Project added" className="space-y-3 rounded-3xl border-2 border-ink bg-amber/30 p-5">
        <h2 className="font-bold">New project</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="title" required placeholder="Title" className="input" />
          <input name="url" required type="url" placeholder="https://…" className="input" />
        </div>
        <textarea name="description" required rows={3} placeholder="Describe this project: what it does, your role, what you built" className="input" />
        <input name="tags" placeholder="Tags, comma separated (e.g. Tailwind, Prisma)" className="input" />
        <p className="text-sm opacity-70">After creating, link it to skills from the Skills page.</p>
        <button className="btn btn-dark text-sm">Add project</button>
      </ActionForm>

      {projects.length === 0 && <p className="opacity-60">No projects yet.</p>}
      {projects.map((p) => (
        <div key={p.id}>
        <ActionForm action={updateProject} className="space-y-3 rounded-3xl border-2 border-ink bg-white p-5" confirm={{ title: `Save “${p.title}”?`, label: "Save" }}>
          <input type="hidden" name="id" value={p.id} />
          <div className="grid gap-2 sm:grid-cols-2">
            <input name="title" defaultValue={p.title} required aria-label="Title" className="input font-bold" />
            <input name="url" defaultValue={p.url} required type="url" aria-label="URL" className="input" />
          </div>
          <textarea name="description" defaultValue={p.description} required rows={3} placeholder="Describe this project" aria-label="Description" className="input" />
          <input name="tags" defaultValue={p.tags.join(", ")} placeholder="Tags, comma separated" aria-label="Tags" className="input" />
          <p className="text-sm opacity-70">
            Linked skills: {p.skills.length ? p.skills.map((sp) => sp.skill.name).join(", ") : "none yet"} — change on the Skills page
          </p>
          <div className="flex gap-2">
            <button className="btn btn-primary text-sm">Save</button>
            <button type="submit" form={`del-${p.id}`} formNoValidate className="btn bg-red-100 text-sm">Delete</button>
          </div>
        </ActionForm>
        <ActionForm
          id={`del-${p.id}`}
          action={deleteProject}
          pendingText="Deleting…"
          successText="Deleted"
          confirm={{ title: `Delete “${p.title}”?`, body: "This can't be undone.", label: "Delete", danger: true }}
        >
          <input type="hidden" name="id" value={p.id} />
        </ActionForm>
        </div>
      ))}
    </div>
  );
}
