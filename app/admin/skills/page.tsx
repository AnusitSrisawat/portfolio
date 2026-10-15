import { getSkills } from "@/lib/data";
import { addProject, addSkill, deleteProject, deleteSkill, moveSkill, updateProject, updateSkill } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminSkills() {
  const skills = await getSkills();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Skills</h1>

      <form action={addSkill} className="flex gap-2">
        <input name="name" required placeholder="New skill name" className="input" />
        <button className="btn btn-primary whitespace-nowrap">Add skill</button>
      </form>

      {skills.map((s, i) => (
        <section key={s.id} className="space-y-4 rounded-3xl border-2 border-ink bg-white p-5">
          <form action={updateSkill} className="space-y-3">
            <input type="hidden" name="id" value={s.id} />
            <input name="name" defaultValue={s.name} required className="input font-bold" />
            <textarea name="description" defaultValue={s.description} rows={2} placeholder="Description" className="input" />
            <input name="tags" defaultValue={s.tags.join(", ")} placeholder="Tags, comma separated" className="input" />
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary text-sm">Save</button>
            </div>
          </form>

          <div className="flex gap-2">
            <form action={moveSkill}>
              <input type="hidden" name="id" value={s.id} /><input type="hidden" name="dir" value="up" />
              <button className="btn text-sm" disabled={i === 0}>↑</button>
            </form>
            <form action={moveSkill}>
              <input type="hidden" name="id" value={s.id} /><input type="hidden" name="dir" value="down" />
              <button className="btn text-sm" disabled={i === skills.length - 1}>↓</button>
            </form>
            <form action={deleteSkill}>
              <input type="hidden" name="id" value={s.id} />
              <button className="btn bg-red-100 text-sm">Delete skill</button>
            </form>
          </div>

          <div className="space-y-2 border-t-2 border-dashed border-ink/20 pt-4">
            <h2 className="font-bold">Projects</h2>
            {s.projects.map((pr) => (
              <div key={pr.id} className="rounded-xl bg-cream p-3">
                <form action={updateProject} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_1fr]">
                  <input type="hidden" name="id" value={pr.id} />
                  <input name="title" defaultValue={pr.title} required aria-label="Title" className="input" />
                  <input name="url" defaultValue={pr.url} required type="url" aria-label="URL" className="input" />
                  <input name="note" defaultValue={pr.note} placeholder="Note (optional)" aria-label="Note" className="input" />
                  <div className="flex gap-2 sm:col-span-3">
                    <button className="btn btn-primary px-3 py-0.5 text-xs">Save</button>
                    <button formAction={deleteProject} formNoValidate className="btn px-3 py-0.5 text-xs">Remove</button>
                  </div>
                </form>
              </div>
            ))}
            <form action={addProject} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_1fr_auto]">
              <input type="hidden" name="skillId" value={s.id} />
              <input name="title" required placeholder="Title" className="input" />
              <input name="url" required type="url" placeholder="https://…" className="input" />
              <input name="note" placeholder="Note (optional)" className="input" />
              <button className="btn btn-dark text-sm">Add</button>
            </form>
          </div>
        </section>
      ))}
    </div>
  );
}
