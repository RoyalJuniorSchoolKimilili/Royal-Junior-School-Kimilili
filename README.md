# Royal Junior School Kimilili

School website and management portal for Royal Junior School Kimilili.

## Technology
- Next.js App Router with static export.
- GitHub Pages hosting.
- Supabase Auth and PostgreSQL with Row Level Security (RLS).

## Local development
1. Install Node.js 22 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Run `npm run dev`.

## Deployment
Pushing to `main` runs the GitHub Actions Pages workflow. Set the repository's Pages build source to **GitHub Actions**.

Add these two GitHub Actions repository variables under **Settings → Secrets and variables → Actions → Variables**:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://rtfltpwzrjylympskeus.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the Supabase project's publishable key.

These are public browser configuration values, not service credentials. Never add a service-role or secret key to GitHub variables used by the static frontend.

The production build exports to `out/` and uses the repository base path `/Royal-Junior-School-Kimilili`.

## School website
The original school HTML is preserved at `public/legacy-school.html` and is currently displayed by the Next.js homepage. This keeps the existing crest, branding, school details, admissions and fee information intact while the new portal is developed separately.

## Supabase database
The initial database schema is applied to the Supabase project. Migration files are in `supabase/migrations/`; the access model is documented in [docs/DATABASE-DESIGN.md](docs/DATABASE-DESIGN.md).

Created tables include profiles, classes, subjects, academic terms, learners, parent links, teacher assignments, attendance, assessments, marks, fee structures, fee payments, payment submissions, learner documents, notices and audit logs.

All 16 public application tables have RLS enabled. The private `learner-documents` Storage bucket is not public. Security advisor currently reports no findings.

### First administrator setup
1. Create the school's first administrator account in Supabase Authentication.
2. In Supabase SQL Editor, promote that account (replace the email):
   ```sql
   update public.profiles p
   set role = 'admin', approval_status = 'approved'
   from auth.users u
   where p.id = u.id and lower(u.email) = lower('YOUR_ADMIN_EMAIL');
   ```
3. Sign in at `/portal/`. The administrator can then approve school-issued teacher/parent accounts, add learners, link guardians and assign classes.

New Auth users automatically receive a pending parent profile. The school must approve the account and link learners before the parent can view school records.

## Payment safety
Parent payment submissions are claims for staff review only. They do not automatically create approved payments or alter balances. M-Pesa callback verification requires a server-side integration and is not enabled in this static browser application.

## Security
- Never commit `.env.local`, service-role keys, passwords or learner records.
- The browser application uses only the Supabase publishable key.
- RLS, not client-side route guards, enforces data access.
- Pending/rejected accounts cannot access school records.
- Parent records are limited to linked learners; teacher access is limited to assigned classes.
- Keep all learner documents in the private Storage bucket.
