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

  return (
    <main className="auth-page directory-page">
      <section className="auth-card directory-card">
        <a className="auth-back" href="/Royal-Junior-School-Kimilili/portal/dashboard/">← Back to school dashboard</a>
        <p className="eyebrow">ROYAL JUNIOR SCHOOL · KIMILILI</p>
        <h1>2026 Learner Directory</h1>
        <p className="directory-note">Confidential school records. Accessible only to approved administrators, school leaders and teachers.</p>
        <div className="directory-tools">
          <input aria-label="Search learners" placeholder="Search grade, learner, parent or phone…" value={query} onChange={e => setQuery(e.target.value)} />
          <select aria-label="Filter by grade" value={grade} onChange={e => setGrade(e.target.value)}>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <p className="directory-count">{loading ? "Loading learner records…" : `${filtered.length} of ${rows.length} records`}</p>
        {error && <p role="alert" className="portal-error">{error}</p>}
        {!loading && !error && rows.length === 0 && <p className="module-empty">The directory table is ready. Learner records have not yet been imported.</p>}
        {!loading && filtered.length > 0 && (
          <div className="table-scroll">
            <table className="school-data-table">
              <thead><tr><th>Grade</th><th>Name</th><th>Parent Name</th><th>Phone</th></tr></thead>
              <tbody>{filtered.map(row => <tr key={row.id}>
                <td>{row.grade}</td><td><a className="directory-learner-link" href={"/Royal-Junior-School-Kimilili/portal/learner/?"+(row.learner_id?"id="+encodeURIComponent(row.learner_id):"directoryId="+encodeURIComponent(row.id))}>{row.learner_name} ↗</a></td><td>{row.parent_name ?? ""}</td><td>{row.parent_phone ?? ""}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
      <style jsx>{`
        .directory-card{max-width:1100px;width:100%}
        .directory-note{color:#64748b;font-size:.9rem;margin:.5rem 0 1rem}
        .directory-tools{display:grid;grid-template-columns:2fr 1fr;gap:.75rem;margin:1rem 0}
        .directory-tools input,.directory-tools select{min-width:0;width:100%;padding:.8rem;border:1px solid #cbd5e1;border-radius:10px;font:inherit;background:#fff;color:#0f172a}
        .directory-count{font-size:.9rem;color:#475569}.directory-learner-link{color:#1d4ed8;font-weight:650;text-decoration:underline;text-underline-offset:3px}
        @media(max-width:640px){.directory-tools{grid-template-columns:1fr}.directory-card{padding:1rem}}
      `}</style>
    </main>
  );
}
