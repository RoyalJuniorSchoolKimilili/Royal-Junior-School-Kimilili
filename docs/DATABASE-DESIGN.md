# Royal Junior School Kimilili — Database and access design

The initial database migration is [`supabase/migrations/20261124161210_school_core_rls.sql`](../supabase/migrations/20261124161210_school_core_rls.sql).

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

The auth trigger creates a pending parent profile for every new auth user. The first administrator is manually promoted once. New Auth users are created through Supabase Authentication; administrators can then approve their profiles, link learners and assign teacher classes.

## Payment safety
Parent payment submissions are claims only. They do not create approved fee payments or alter balances. M-Pesa callback verification requires a server-side integration and is not part of the static browser app.

## CBE curriculum planning and learner progress

The `assessments` table stores curriculum-planning and assessment details alongside the class, learning area and term:
- Grade / level, assessment purpose, strand and sub-strand.
- National Goal(s) of Education, curriculum-design essence statement, general and specific learning outcomes, key inquiry question(s).
- Suggested learning experiences, core competencies, values, Pertinent and Contemporary Issues (PCIs), and Community Service Learning connection.
- Learning resources, assessment method and tool, assessment rubric, evidence of learning, inclusion/adaptations and teacher reflection.
- KICD curriculum-design source/reference.

The `marks` table also stores descriptive competency progress, learner strengths, support needs, next steps, evidence notes, learner reflection and suggested parent support. Numerical scores are optional; the form does not impose a made-up national CBE grading scale.

The portal provides grade-specific learning-area choices for PP1, PP2 and Grades 1–9, based on KICD curriculum-design pages. Teachers must copy the exact strand, sub-strand, learning outcomes and rubrics from the current design for their grade and learning area; the portal does not invent official curriculum codes or learning outcomes.

Relevant migrations:
- `20261124182100_cbe_assessment_and_learner_progress_fields.sql`
- `20261124182500_cbe_curriculum_design_components_and_areas.sql`
- `20261124183000_add_mathematical_activities_learning_area.sql`
- `20261124183500_add_cbe_assessment_approach.sql`

Official reference: [KICD curriculum designs](https://kicd.ac.ke/cbc-materials/curriculum-designs/regular-curriculum-designs/) and [Basic Education Curriculum Framework](https://kicd.ac.ke/curriculum-reform/basic-education-curriculum-framework/).

## Scope

The CBE assessment and learner-progress fields are now part of the live database schema and portal forms. Exact grade-specific strand/sub-strand/outcome/rubric text remains sourced from the current KICD curriculum designs rather than being guessed or hard-coded. The school's original report formats and approved fee items remain unchanged.

### Grade-specific KICD learning-area labels

The portal assessment form filters the learning-area dropdown by grade, using the KICD grade-band curriculum directories:
- PP1–PP2: Language Activities, Mathematics Activities, Creative Arts, Environmental Activities and the separate CRE/HRE/IRE options.
- Grades 1–3: English, Kiswahili, Mathematics, Environmental Activities, Creative Activities, separate CRE/HRE/IRE options and Indigenous Language.
- Grades 4–6: English, Kiswahili, Mathematics, Agriculture & Nutrition, Social Studies, Creative Activities, Science & Technology, separate CRE/HRE/IRE options, Indigenous Language and optional foreign languages.
- Grades 7–9: English, Kiswahili, Mathematics, Integrated Science, Agriculture, Pre-Technical Studies, Creative Arts and Sports, Social Studies, separate CRE/HRE/IRE options, Indigenous Language and optional foreign languages.

Official KICD directories: [Pre-Primary / regular designs](https://kicd.ac.ke/cbc-materials/curriculum-designs/regular-curriculum-designs/), [Lower Primary](https://kicd.ac.ke/cbc-materials/lower-primary/), [Upper Primary](https://kicd.ac.ke/cbc-materials/curriculum-designs/upper-primary-designs/), [Grade 7 designs](https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-seven-designs/) and [Junior School designs](https://kicd.ac.ke/cbc-materials/curriculum-designs/junior-school-designs/).

The portal links teachers to the correct KICD directory for the selected grade. It does not copy or fabricate KICD strand/outcome text; teachers should use the current official design and record its exact wording in the assessment form.
