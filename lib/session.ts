import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Call at the top of every admin page. Layouts are not re-run for every request
// (Next can skip them), so the page must check the session itself.
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
}
