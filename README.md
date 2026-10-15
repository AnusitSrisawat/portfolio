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
