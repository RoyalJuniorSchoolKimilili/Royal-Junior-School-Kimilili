"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LearnerRow = {
  id: string;
  grade: string;
  learner_name: string;
  parent_name: string | null;
  parent_phone: string | null;
  learner_id: string | null;
};

export default function LearnerDirectory2026Page() {
  const router = useRouter();
  const [rows, setRows] = useState<LearnerRow[]>([]);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("All grades");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.replace("/Royal-Junior-School-Kimilili/portal/");
        return;
      }
      const { data: profile } = await supabase.from("profiles")
        .select("role, approval_status").eq("id", auth.user.id).maybeSingle();
      if (!profile || profile.approval_status !== "approved" ||
          (!["admin", "teacher", "director", "headteacher"].includes(profile.role))) {
        router.replace("/Royal-Junior-School-Kimilili/portal/dashboard/");
        return;
      }
      const { data, error: fetchError } = await (supabase.from("learner_directory_2026" as any) as any)
        .select("id,grade,learner_name,parent_name,parent_phone,learner_id")
        .order("grade", { ascending: true })
        .order("learner_name", { ascending: true });
      if (!active) return;
      if (fetchError) setError(fetchError.message);
      else setRows((data ?? []) as LearnerRow[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [router]);

  const grades = useMemo(() => ["All grades", ...Array.from(new Set(rows.map(r => r.grade))).sort()], [rows]);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return rows.filter(r => (grade === "All grades" || r.grade === grade) &&
      (!term || [r.grade, r.learner_name, r.parent_name ?? "", r.parent_phone ?? ""]
        .some(v => v.toLocaleLowerCase().includes(term))));
  }, [rows, query, grade]);

  // Keep every learner together with classmates in a single grade section.
  const groupedLearners = useMemo(() => {
    const groups = new Map<string, LearnerRow[]>();
    for (const learner of filtered) {
      const classmates = groups.get(learner.grade) ?? [];
      classmates.push(learner);
      groups.set(learner.grade, classmates);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      const rank = (value: string) => {
        const normalized = value.trim().toLowerCase();
        if (/^(pg|playgroup)$/.test(normalized)) return 0;
        if (/^(pp1|pre.?primary ?1)$/.test(normalized)) return 1;
        if (/^(pp2|pre.?primary ?2)$/.test(normalized)) return 2;
        const number = normalized.match(/(?:grade|gr)\\s*(\\d+)/);
        return number ? 2 + Number(number[1]) : 100;
      };
      return rank(a) - rank(b) || a.localeCompare(b);
    });
  }, [filtered]);

  return (
    <main className="auth-page directory-page">
      <section className="auth-card directory-card">
        <a className="auth-back" href="/Royal-Junior-School-Kimilili/portal/dashboard/">← Back to school dashboard</a>
        <p className="eyebrow">ROYAL JUNIOR SCHOOL · KIMILILI</p>
        <h1>2026 Learner Directory</h1>
        <div className="directory-tools"><a className="directory-learner-link" href="/Royal-Junior-School-Kimilili/portal/classes/">View class-wise register ↗</a><a className="directory-learner-link" href="/Royal-Junior-School-Kimilili/portal/receipts/">School receipts ↗</a><a className="directory-learner-link" href="/Royal-Junior-School-Kimilili/portal/admission-letter/">Admission letter studio ↗</a><a className="directory-learner-link" href="/Royal-Junior-School-Kimilili/portal/parent-linking/">Admin: link parent accounts ↗</a></div><p className="directory-note">Confidential school records. Accessible only to approved administrators, school leaders and teachers.</p>
        <div className="directory-tools">
          <input aria-label="Search learners" placeholder="Search grade, learner, parent or phone…" value={query} onChange={e => setQuery(e.target.value)} />
          <select aria-label="Filter by grade" value={grade} onChange={e => setGrade(e.target.value)}>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <p className="directory-count">{loading ? "Loading learner records…" : `${filtered.length} of ${rows.length} records`}</p>
        {error && <p role="alert" className="portal-error">{error}</p>}
        {!loading && !error && rows.length === 0 && <p className="module-empty">The directory table is ready. Learner records have not yet been imported.</p>}
        {!loading && groupedLearners.length > 0 && (
          <div className="grade-groups">
            {groupedLearners.map(([gradeName, classmates]) => (
              <section className="grade-group" key={gradeName}>
                <div className="grade-heading"><h2>{gradeName}</h2><span>{classmates.length} learner{classmates.length===1?"":"s"}</span></div>
                <div className="table-scroll">
                  <table className="school-data-table">
                    <thead><tr><th>Name</th><th>Parent Name</th><th>Phone</th></tr></thead>
                    <tbody>{classmates.map(row => <tr key={row.id}>
                      <td><a className="directory-learner-link" href={"/Royal-Junior-School-Kimilili/portal/learner/?"+(row.learner_id?"id="+encodeURIComponent(row.learner_id):"directoryId="+encodeURIComponent(row.id))}>{row.learner_name} ↗</a></td><td>{row.parent_name ?? ""}</td><td>{row.parent_phone ?? ""}</td>
                    </tr>)}</tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
      <style jsx>{`
        .directory-card{max-width:1100px;width:100%}
        .directory-note{color:#64748b;font-size:.9rem;margin:.5rem 0 1rem}
        .directory-tools{display:grid;grid-template-columns:2fr 1fr;gap:.75rem;margin:1rem 0}
        .directory-tools input,.directory-tools select{min-width:0;width:100%;padding:.8rem;border:1px solid #cbd5e1;border-radius:10px;font:inherit;background:#fff;color:#0f172a}
        .directory-count{font-size:.9rem;color:#475569}.directory-learner-link{color:#1d4ed8;font-weight:650;text-decoration:underline;text-underline-offset:3px}
        .grade-groups{display:grid;gap:1.25rem}.grade-group{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;background:#fff}
        .grade-heading{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.85rem 1rem;background:#f1f5f9;border-bottom:1px solid #e2e8f0}
        .grade-heading h2{margin:0;font-size:1.05rem;color:#0f172a}.grade-heading span{font-size:.85rem;color:#475569;white-space:nowrap}
        .grade-group .table-scroll{margin:0}.grade-group .school-data-table{margin:0}
        @media(max-width:640px){.directory-tools{grid-template-columns:1fr}.directory-card{padding:1rem}}
      `}</style>
    </main>
  );
}
