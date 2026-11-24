# Royal Junior School Kimilili — Database and access design

Status: proposal only. This document is not an applied database migration.

## 1. Accounts and approval

### `profiles`
One row per `auth.users.id`. Fields: `id` (FK to auth.users), `full_name`, `phone`, `role` (`admin`, `teacher`, `parent`), `approval_status` (`pending`, `approved`, `rejected`), timestamps.

- New registrations become pending parents by default; users cannot choose or edit their role.
- Admin promotion and approval are performed only by an existing trusted administrator through a controlled administrative process.
- No user may update their own role or approval status.
- Pending and rejected accounts cannot read school records.

## 2. School structure

- `classes`: daycare, pre-primary and Grades 1–9; class display name and active flag.
- `subjects`: CBC learning areas / subjects.
- `academic_terms`: academic year, term number, dates and active flag.
- `teacher_classes`: approved teacher-to-class assignments, with optional subject assignment.

## 3. Learner records

- `learners`: admission number, learner name, class, date of birth, gender, day/boarding status, guardian contact and non-public medical/learning notes.
- `parent_learners`: many-to-many parent/guardian links with relationship and primary-contact flag.
- `learner_documents`: document metadata only; files live in a private Storage bucket. Document types include birth certificate, assessment report, KEPSEA certificate and prior report.

## 4. Attendance and academics

- `attendance`: learner, class, date, status (present/absent/late), recorded by and note. Unique learner/date constraint prevents duplicate daily marks.
- `assessments`: class, subject, term, title, date and teacher.
- `marks`: assessment, learner, score/grade, feedback and teacher.
- CBC competency evidence can be added as a separate normalized table after the school's required report-card format is confirmed.

## 5. Fees and payment records

- `fee_structures`: class, day/boarding category, academic year/term, item and expected amount in KES.
- `fee_payments`: approved/posted payments only, amount, payment method, reference, receipt number, date, recorder and approval state.
- `payment_submissions`: parent-submitted M-Pesa/payment claims awaiting school verification. A claim does not reduce the fee balance until approved.
- Admission, interview, development and uniform payments remain distinct from term-fee balances, matching the existing website's wording.
- Do not trust payment references or callback data sent by the browser. Any future M-Pesa integration must verify callbacks in a server-side Edge Function and use secrets only there.

## 6. Notices and audit

- `notices`: school/class notices with author, publication window and audience.
- `notice_recipients`: optional targeted delivery to linked parents/learners.
- `audit_logs`: sensitive administrative actions, actor, target, action and timestamp. No passwords, tokens or unnecessary medical details.

## 7. Access rules (RLS is the authority)

| Role | Allowed access |
|---|---|
| Admin, approved | Manage school records, users' approval, classes, fees, attendance, assessments, payments and notices |
| Teacher, approved | Read assigned classes and their learners; record attendance and marks only for assigned classes |
| Parent, approved | Read only learners explicitly linked in `parent_learners`; view their attendance, reports, notices and fee ledger; submit payment claims for linked learners |
| Pending/rejected | No access to school data |

Additional safeguards:
- Enable RLS on every public application table and grant only the required Data API privileges.
- Parent/teacher relationships are checked in SQL policies, never trusted from browser input or editable user metadata.
- Do not use `raw_user_meta_data` as an authorization source.
- A private, non-exposed schema will hold narrowly scoped authorization helper functions where required. Any SECURITY DEFINER helper must have a fixed search path, verify `auth.uid()`, and have EXECUTE revoked from PUBLIC/anon; grant only the authenticated role that needs it.
- Private learner files require Storage object policies that verify the linked learner/parent or assigned teacher/admin. No public bucket.
- No privileged service-role key in the Next.js static bundle.
- Views, if added, must use `security_invoker = true` or be inaccessible to client roles.

## 8. Proposed build sequence

1. Approve this table and role model.
2. Create migration using Supabase CLI in a local project and review the generated SQL.
3. Apply to Supabase; verify tables, grants, RLS and security/performance advisors.
4. Add Auth screens and pending-account flow.
5. Build admin, teacher and parent portal screens against RLS-protected data.
6. Add private document uploads and test cross-account denial.
7. Add payment verification only after the payment workflow and any provider costs are approved.

## 9. Decisions still needed before migration

- Confirm the class names/order and whether daycare and pre-primary are separate database classes.
- Confirm whether parents register themselves or the school creates their accounts.
- Confirm the exact report-card/CBC assessment format.
- Confirm whether M-Pesa is initially recorded manually by staff or integrated with Daraja later.

No learner records, credentials, live payment data or seed accounts belong in source control.
