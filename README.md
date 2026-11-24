# Royal Junior School Kimilili

School management system for Royal Junior School Kimilili.

## Technology
- Next.js App Router with static export.
- GitHub Pages hosting.
- Supabase Auth and PostgreSQL with Row Level Security (RLS).

## Local development
1. Install Node.js 22 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Supabase project URL and publishable/anon key.
5. Run `npm run dev`.

## Deployment
Pushing to `main` runs the GitHub Actions Pages workflow. The repository's GitHub Pages setting must use **GitHub Actions** as its build and deployment source.

The production build exports to `out/` and uses the repository base path `/Royal-Junior-School-Kimilili`.

## Security
- Never commit `.env.local`, service-role keys, passwords or learner records.
- The browser application may use only the Supabase publishable/anon key.
- Database RLS policies—not client-side route guards—must enforce admin, teacher and parent access.
- Keep learner documents in a private Storage bucket with restrictive policies.
- The existing `public.rls_auto_enable()` function is not callable by PUBLIC, anon or authenticated roles.

## Current implementation status
The static Next.js foundation and GitHub Pages workflow are committed. The homepage is currently a starter placeholder, not a recreation of the original school website. The original school `index.html` must be supplied again so its exact branding, crest, school information, fees and admissions content can be retained.

The Supabase project is active and has no application tables yet. The school schema and RLS policies have not been applied. Do not use real learner data until those policies have been implemented and tested.


## Database design review

See [docs/DATABASE-DESIGN.md](docs/DATABASE-DESIGN.md) for the proposed learner, guardian, teacher, class, attendance, assessment, fee, payment, notice and audit schema and the role-based RLS model. This is a design proposal only; no school tables or policies have been applied.

## Portal sign-in

The initial email/password sign-in page is available at `/portal/`. Configure the public Supabase URL and publishable key as GitHub Actions repository variables before deploying. Do not add a service-role key. Sign-in does not grant access to learner records: the approval/profile schema and RLS policies must be deployed first.
