# Portfolio

Next.js (App Router) + Tailwind v4 + Prisma/Postgres + Auth.js (GitHub login).
Public landing page at `/`; owner-only admin at `/admin` to edit profile, skills and project links.

## Setup
```bash
cp .env.example .env        # fill in values
npm install
npm run db:push             # create tables
npm run db:seed             # optional sample data
npm run dev
```

### GitHub OAuth
Create an OAuth App at https://github.com/settings/developers
Callback URL: `http://localhost:3000/api/auth/callback/github` (and your production URL).
Only the GitHub user in `ADMIN_GITHUB_USERNAME` can sign in.

### Deploy (Vercel)
Set the same env vars (use a hosted Postgres such as Neon/Supabase for `DATABASE_URL`).

### Upgrading from the one-skill-per-project schema
Projects are now linked to many skills. If you already have data, run once **before** `npm run db:push`:
```bash
psql "$DATABASE_URL" -f prisma/migrate-project-links.sql
npm run db:push -- --accept-data-loss   # drops the old Project.skillId column
```

### Upgrading to ordered project links (per-skill project order)
Skills now keep their own ordering of projects in a `SkillProject` table. If you already have links, run once **before** `npm run db:push`:
```bash
psql "$DATABASE_URL" -f prisma/migrate-skill-project.sql
npm run db:push -- --accept-data-loss   # drops the old "_ProjectToSkill" table
```

### Neon tip: use the direct (non-pooled) URL for `db:push`
Neon's `-pooler` host runs through PgBouncer, which can make `prisma db push` hang or fail on its advisory lock.
Use the pooled URL for the running app, but run schema commands with the direct URL (same host without `-pooler`):
```bash
DATABASE_URL="postgresql://USER:PASS@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require" npx prisma db push
```
