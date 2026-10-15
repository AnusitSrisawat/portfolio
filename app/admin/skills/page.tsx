import { db } from "@/lib/db";
import { getGroups } from "@/lib/data";
import {
  addCategory, addSkill, deleteCategory, deleteSkill,
  moveCategory, moveSkill, renameCategory, updateSkill,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

const Move = ({ action, id, last, first }: { action: (fd: FormData) => Promise<void>; id: number; first: boolean; last: boolean }) => (
  <>
    {(["up", "down"] as const).map((dir) => (
      <form key={dir} action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value={dir} />
        <button className="btn px-3 py-0.5 text-sm" disabled={dir === "up" ? first : last} aria-label={`Move ${dir}`}>
          {dir === "up" ? "↑" : "↓"}
        </button>
      </form>
    ))}
  </>
);

export default async function AdminSkills() {
  const [groups, categories] = await Promise.all([
    getGroups(),
    db.category.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Skills</h1>

      <form action={addCategory} className="flex gap-2">
        <input name="name" required placeholder="New category (e.g. Frontend)" className="input" />
        <button className="btn btn-dark whitespace-nowrap">Add category</button>
      </form>

      {groups.map((g, gi) => (
        <section key={g.id ?? "other"} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-ink p-3 text-white">
            {g.id !== null ? (
              <>
                <form action={renameCategory} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={g.id} />
                  <input name="name" defaultValue={g.name} required aria-label="Category name" className="input min-w-0 flex-1 font-bold text-ink" />
                  <button className="btn btn-primary px-3 py-0.5 text-sm text-ink">Rename</button>
                </form>
                <Move action={moveCategory} id={g.id} first={gi === 0} last={gi >= categories.length - 1} />
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={g.id} />
                  <button className="btn bg-red-100 px-3 py-0.5 text-sm text-ink" title="Skills are kept and moved to Other">Delete</button>
                </form>
              </>
            ) : (
              <h2 className="px-2 font-bold">Other (no category)</h2>
            )}
          </div>

          {g.skills.map((s, i) => (
            <article key={s.id} className="space-y-4 rounded-3xl border-2 border-ink bg-white p-5">
              <form action={updateSkill} className="space-y-3">
                <input type="hidden" name="id" value={s.id} />
                <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                  <input name="name" defaultValue={s.name} required className="input font-bold" />
                  <select name="categoryId" defaultValue={s.categoryId ?? ""} aria-label="Category" className="input">
                    <option value="">Other (no category)</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <textarea name="description" defaultValue={s.description} rows={2} placeholder="Description" className="input" />
                <input name="tags" defaultValue={s.tags.join(", ")} placeholder="Tags, comma separated (e.g. Next.js, Hooks)" className="input" />
                <button className="btn btn-primary text-sm">Save</button>
              </form>

              <div className="flex gap-2">
                <Move action={moveSkill} id={s.id} first={i === 0} last={i === g.skills.length - 1} />
                <form action={deleteSkill}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="btn bg-red-100 text-sm">Delete skill</button>
                </form>
              </div>

              <div className="border-t-2 border-dashed border-ink/20 pt-4 text-sm">
                <h3 className="mb-1 font-bold">Projects</h3>
                {s.projects.length ? (
                  <ul className="list-disc pl-5">
                    {s.projects.map((pr) => <li key={pr.id}>{pr.title}</li>)}
                  </ul>
                ) : (
                  <p className="opacity-60">None linked.</p>
                )}
                <a href="/admin/projects" className="mt-1 inline-block underline">Manage projects →</a>
              </div>
            </article>
          ))}

          <form action={addSkill} className="flex gap-2">
            <input type="hidden" name="categoryId" value={g.id ?? ""} />
            <input name="name" required placeholder={`Add skill to ${g.name}`} className="input" />
            <button className="btn btn-primary whitespace-nowrap">Add skill</button>
          </form>
        </section>
      ))}
    </div>
  );
}
