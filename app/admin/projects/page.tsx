import { db } from "@/lib/db";
import { getGroups } from "@/lib/data";
import { addProject, deleteProject, updateProject } from "@/lib/actions";
import { ActionForm } from "@/components/ActionForm";

export const dynamic = "force-dynamic";

type G = Awaited<ReturnType<typeof getGroups>>;

function SkillPicker({ groups, selected = [] }: { groups: G; selected?: number[] }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-semibold">Skills used</legend>
      {groups.map((g) => (
        <div key={g.id ?? "other"} className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="w-28 shrink-0 text-xs font-semibold uppercase opacity-60">{g.name}</span>
          {g.skills.map((s) => (
            <label key={s.id} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="skillIds" value={s.id} defaultChecked={selected.includes(s.id)} />
              {s.name}
            </label>
          ))}
        </div>
      ))}
    </fieldset>
  );
}

export default async function AdminProjects() {
  const [groups, projects] = await Promise.all([
    getGroups(),
    db.project.findMany({ orderBy: { id: "desc" }, include: { skills: { select: { id: true } } } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Projects</h1>

      <ActionForm action={addProject} resetOnSuccess pendingText="Adding…" successText="Project added" className="space-y-3 rounded-3xl border-2 border-ink bg-amber/30 p-5">
        <h2 className="font-bold">New project</h2>
        <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_1fr]">
          <input name="title" required placeholder="Title" className="input" />
          <input name="url" required type="url" placeholder="https://…" className="input" />
          <input name="note" placeholder="Note (optional)" className="input" />
        </div>
        <input name="tags" placeholder="Tags, comma separated (e.g. Tailwind, Prisma)" className="input" />
        <SkillPicker groups={groups} />
        <button className="btn btn-dark text-sm">Add project</button>
      </ActionForm>

      {projects.length === 0 && <p className="opacity-60">No projects yet.</p>}
      {projects.map((p) => (
        <div key={p.id}>
        <ActionForm action={updateProject} className="space-y-3 rounded-3xl border-2 border-ink bg-white p-5" confirm={{ title: `Save “${p.title}”?`, label: "Save" }}>
          <input type="hidden" name="id" value={p.id} />
          <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_1fr]">
            <input name="title" defaultValue={p.title} required aria-label="Title" className="input font-bold" />
            <input name="url" defaultValue={p.url} required type="url" aria-label="URL" className="input" />
            <input name="note" defaultValue={p.note} placeholder="Note (optional)" aria-label="Note" className="input" />
          </div>
          <input name="tags" defaultValue={p.tags.join(", ")} placeholder="Tags, comma separated" aria-label="Tags" className="input" />
          <SkillPicker groups={groups} selected={p.skills.map((s) => s.id)} />
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
