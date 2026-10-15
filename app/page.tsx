import { getProfile, getSkills } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [p, skills] = await Promise.all([getProfile(), getSkills()]);
  const names = skills.map((s) => s.name);
  const marquee = names.length ? [...names, ...names, ...names, ...names] : [];

  return (
    <main>
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <a href="#top" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber text-ink">
            {p.name.charAt(0).toUpperCase()}
          </span>
          {p.name.split(" ")[0]}.
        </a>
        <nav className="hidden gap-6 text-sm font-medium sm:flex">
          <a href="#skills">Skills</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="#contact" className="btn btn-dark text-sm">Let&apos;s talk</a>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 pt-6 md:grid-cols-2">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight md:text-7xl">
            {p.headline}
            <br />
            <span className="text-amber-deep">{p.name}</span>
          </h1>
          <p className="mt-3 text-xl font-semibold">{p.role}</p>
          {p.bio && <p className="mt-4 max-w-md text-black/70">{p.bio}</p>}
          <div className="mt-8 flex gap-3">
            <a href="#skills" className="btn btn-primary">Portfolio</a>
            <a href="#contact" className="btn bg-white">Hire me</a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-x-6 bottom-0 top-10 rounded-[2.5rem] bg-amber" />
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatarUrl} alt={p.name} className="relative aspect-[4/5] w-full rounded-[2.5rem] object-cover" />
          ) : (
            <div className="relative grid aspect-[4/5] w-full place-items-center text-9xl font-extrabold">
              {p.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </section>

      {/* Marquee */}
      {marquee.length > 0 && (
        <div className="overflow-hidden bg-ink py-4 text-white" aria-hidden="true">
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-lg font-semibold">
            {marquee.map((n, i) => (
              <span key={i} className="flex items-center gap-10">
                {n}
                <span className="text-amber">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <section id="skills" className="mx-auto max-w-4xl px-4 py-20">
        <p className="text-sm font-semibold text-amber-deep">● My skills</p>
        <h2 className="mb-8 text-4xl font-extrabold md:text-5xl">
          What I do &amp; what I&apos;ve built
        </h2>
        <div className="space-y-3">
          {skills.length === 0 && <p className="text-black/60">No skills yet.</p>}
          {skills.map((s, i) => (
            <details
              key={s.id}
              open={i === 0}
              className="group rounded-3xl border-2 border-ink bg-white open:bg-ink open:text-white"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-xl font-bold">
                <span className="flex items-center gap-4">
                  <span className="text-sm font-semibold opacity-50">{String(i + 1).padStart(2, "0")}</span>
                  {s.name}
                </span>
                <span className="chev grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber text-ink transition-transform">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </span>
              </summary>
              <div className="space-y-4 px-6 pb-6">
                {s.description && <p className="max-w-2xl opacity-80">{s.description}</p>}
                {s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full border border-white/40 px-3 py-1 text-xs">{t}</span>
                    ))}
                  </div>
                )}
                {s.projects.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {s.projects.map((pr) => (
                      <li key={pr.id}>
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-2xl bg-amber px-4 py-3 font-semibold text-ink hover:bg-amber-deep"
                        >
                          <span>
                            {pr.title}
                            {pr.note && <span className="block text-xs font-normal opacity-70">{pr.note}</span>}
                          </span>
                          <span aria-hidden>↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm opacity-60">Projects coming soon.</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* About */}
      {p.about && (
        <section id="about" className="bg-amber py-20">
          <div className="mx-auto max-w-4xl px-4">
            <p className="text-sm font-semibold">● About me</p>
            <h2 className="mb-4 text-4xl font-extrabold md:text-5xl">Who is {p.name}?</h2>
            <p className="max-w-2xl whitespace-pre-line text-lg">{p.about}</p>
          </div>
        </section>
      )}

      {/* Contact */}
      <footer id="contact" className="bg-ink py-16 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 px-4">
          <h2 className="text-4xl font-extrabold">Let&apos;s work together</h2>
          <div className="flex flex-wrap gap-3">
            {p.email && <a className="btn btn-primary text-ink" href={`mailto:${p.email}`}>{p.email}</a>}
            {p.github && <a className="btn border-white" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {p.linkedin && <a className="btn border-white" href={p.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          </div>
          <a href="/admin" className="text-xs text-white/40 hover:text-white">Admin</a>
        </div>
      </footer>
    </main>
  );
}
