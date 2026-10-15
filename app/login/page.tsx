import { loginAction } from "@/lib/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={loginAction} className="w-full max-w-sm space-y-4 rounded-3xl border-2 border-ink bg-white p-8">
        <h1 className="text-3xl font-extrabold">Admin sign in</h1>
        {error && <p className="rounded-xl bg-red-100 p-3 text-sm">Sign in failed. Only the site owner can sign in.</p>}
        <button className="btn btn-dark w-full">Continue with GitHub</button>
        <a href="/" className="block text-center text-sm underline">← Back to site</a>
      </form>
    </main>
  );
}
