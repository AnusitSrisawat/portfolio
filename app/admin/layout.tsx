import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-4 font-semibold">
          <a href="/admin">Profile</a>
          <a href="/admin/skills">Skills</a>
          <a href="/admin/projects">Projects</a>
          <a href="/" target="_blank">View site ↗</a>
        </nav>
        <form action={logoutAction}>
          <button className="btn bg-white text-sm">Sign out</button>
        </form>
      </header>
      {children}
    </div>
  );
}
