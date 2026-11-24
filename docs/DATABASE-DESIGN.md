# Royal Junior School Kimilili — Database and access design

The first database migration is committed at [`supabase/migrations/20261124161210_school_core_rls.sql`](../supabase/migrations/202611240001_school_core_rls.sql).

## Account creation
School-issued accounts are the default. A new Supabase Auth user automatically receives a `profiles` row with role `parent` and status `pending`. A trusted administrator must approve the account and attach the correct learner(s). Users cannot promote or approve themselves.

## Tables
`profiles`, `classes`, `subjects`, `academic_terms`, `learners`, `parent_learners`, `teacher_classes`, `attendance`, `assessments`, `marks`, `fee_structures`, `fee_payments`, `payment_submissions`, `learner_documents`, `notices`, and `audit_logs`.

## Access rules
- Approved administrators manage school data and account approvals.
- Approved teachers read assigned classes and enter attendance/marks only for assigned classes.
- Approved parents read records only for their linked learners and submit payment claims for those learners.
- Pending/rejected accounts cannot access school records.

All public application tables have RLS enabled. The `learner-documents` Storage bucket is private; parents can read documents for linked learners and administrators manage uploads. No service-role key is used in the browser.

## First administrator bootstrap
After the migration, create the first administrator account in Supabase Auth, then run this once in the SQL Editor (replace the email):

```sql
update public.profiles p
set role = 'admin', approval_status = 'approved'
from auth.users u
where p.id = u.id and lower(u.email) = lower('YOUR_ADMIN_EMAIL');
```

The auth trigger creates a pending parent profile for every new auth user. The first administrator is manually promoted once; administrators can then create teacher/parent accounts, approve them, link learners and assign classes.

## Payment safety
Parent payment submissions are claims only. They do not create approved fee payments or alter balances. M-Pesa callback verification requires a server-side integration and is not part of the static browser app.

## Scope
This is the initial operational schema. CBC competency-specific report-card layouts, receipt/admission-letter PDF generation, and the exact fee schedule remain follow-on work so the school's existing report formats and approved fee items are not guessed or overwritten.
