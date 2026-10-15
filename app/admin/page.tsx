import { getProfile } from "@/lib/data";
import { saveProfile } from "@/lib/actions";
import { ActionForm } from "@/components/ActionForm";

export const dynamic = "force-dynamic";

const F = ({ label, name, value, area }: { label: string; name: string; value: string; area?: boolean }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold">{label}</span>
    {area ? (
      <textarea name={name} defaultValue={value} rows={4} className="input" />
    ) : (
      <input name={name} defaultValue={value} className="input" />
    )}
  </label>
);

export default async function AdminProfile() {
  const p = await getProfile();
  return (
    <ActionForm action={saveProfile} className="space-y-4" confirm={{ title: "Save profile?", body: "This updates your public site.", label: "Save" }}>
      <h1 className="text-3xl font-extrabold">Profile</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Name" name="name" value={p.name} />
        <F label="Role" name="role" value={p.role} />
        <F label="Hero headline (e.g. “I'm”)" name="headline" value={p.headline} />
        <F label="Email" name="email" value={p.email} />
        <F label="Avatar image URL" name="avatarUrl" value={p.avatarUrl} />
        <F label="GitHub URL" name="github" value={p.github} />
        <F label="LinkedIn URL" name="linkedin" value={p.linkedin} />
      </div>
      <F label="Short bio (hero)" name="bio" value={p.bio} area />
      <F label="About" name="about" value={p.about} area />
      <button className="btn btn-primary">Save</button>
    </ActionForm>
  );
}
