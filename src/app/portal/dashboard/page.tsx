"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  role: "admin" | "teacher" | "parent";
  approval_status: "pending" | "approved" | "rejected";
};

type Row = Record<string, unknown>;
type ModuleKey = "overview" | "learners" | "attendance" | "assessments" | "results" | "classes" | "fees" | "approvals" | "notices";

const moduleInfo: Record<ModuleKey, { title: string; description: string; table?: string }> = {
  overview: { title: "Dashboard overview", description: "Your Royal Junior School management workspace." },
  learners: { title: "Learners & admissions", description: "Learner register, admission numbers, class placement and enrolment.", table: "learners" },
  attendance: { title: "Daily attendance", description: "Attendance records by learner, class and date. Access is limited by your school role.", table: "attendance" },
  assessments: { title: "CBE assessments", description: "Continuous assessment records by learning area, class and academic term.", table: "assessments" },
  results: { title: "Learner results & progress", description: "Assessment scores, grades and teacher feedback. CBE progress should be interpreted alongside competency evidence.", table: "marks" },
  classes: { title: "Classes, learning areas & terms", description: "School classes, learning areas (subjects) and academic terms.", table: "classes" },
  fees: { title: "Fees & payments", description: "Fee structures, recorded payments and parent payment submissions.", table: "fee_payments" },
  approvals: { title: "Staff & parent approvals", description: "Review school portal profiles and account approval status.", table: "profiles" },
  notices: { title: "School notices", description: "Announcements for the school community and assigned classes.", table: "notices" },
};

const roleModules: Record<Profile["role"], ModuleKey[]> = {
  admin: ["overview", "learners", "attendance", "assessments", "results", "classes", "fees", "approvals", "notices"],
  teacher: ["overview", "learners", "attendance", "assessments", "results", "classes", "notices"],
  parent: ["overview", "learners", "attendance", "assessments", "results", "fees", "notices"],
};

const preferredColumns: Partial<Record<ModuleKey, string[]>> = {
  learners: ["full_name", "admission_number", "class_id", "enrollment_status", "study_mode"],
  attendance: ["attendance_date", "learner_id", "class_id", "status", "note"],
  assessments: ["title", "assessment_date", "class_id", "subject_id", "term_id"],
  results: ["learner_id", "assessment_id", "score", "maximum_score", "grade", "feedback"],
  classes: ["name", "level_order", "active"],
  fees: ["learner_id", "amount_kes", "payment_method", "payment_reference", "status", "paid_at"],
  approvals: ["full_name", "role", "approval_status", "phone"],
  notices: ["title", "audience", "published", "publish_at", "expires_at"],
};

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function ProtectedDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "blocked">("loading");
  const [message, setMessage] = useState("Checking your school account…");
  const [active, setActive] = useState<ModuleKey>("overview");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [dataMessage, setDataMessage] = useState("");

  const visibleModules = useMemo(() => profile ? roleModules[profile.role] : [], [profile]);

  const loadRows = useCallback(async (module: ModuleKey) => {
    const table = moduleInfo[module].table;
    if (!table) { setRows([]); setDataMessage(""); return; }
    setLoadingRows(true);
    setDataMessage("");
    const supabase = createSupabaseBrowserClient();
    let result: { data: unknown[] | null; error: { message: string } | null };
    switch (module) {
      case "learners": result = await supabase.from("learners").select("*").limit(100); break;
      case "attendance": result = await supabase.from("attendance").select("*").limit(100); break;
      case "assessments": result = await supabase.from("assessments").select("*").limit(100); break;
      case "results": result = await supabase.from("marks").select("*").limit(100); break;
      case "classes": result = await supabase.from("classes").select("*").limit(100); break;
      case "fees": result = await supabase.from("fee_payments").select("*").limit(100); break;
      case "approvals": result = await supabase.from("profiles").select("*").limit(100); break;
      case "notices": result = await supabase.from("notices").select("*").limit(100); break;
      default: result = { data: [], error: null };
    }
    setRows((result.data ?? []) as Row[]);
    if (result.error) setDataMessage(result.error.message);
    else if (!result.data?.length) setDataMessage("No records are available here yet. Add school records to Supabase; this section will display records permitted by your account's Row Level Security policies.");
    setLoadingRows(false);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let activeEffect = true;
    async function verifyAccess() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.replace("/portal/"); return; }
      const { data, error } = await supabase.from("profiles").select("full_name, role, approval_status").eq("id", sessionData.session.user.id).single();
      if (!activeEffect) return;
      if (error || !data) {
        setStatus("blocked");
        setMessage("Your school profile could not be verified. Please contact the school administrator.");
        return;
      }
      const account = data as Profile;
      setProfile(account);
      if (account.approval_status !== "approved") {
        setStatus("blocked");
        setMessage(account.approval_status === "pending" ? "Your account is awaiting school approval. Dashboard access is locked." : "This account has not been approved for school portal access. Please contact the school office.");
        return;
      }
      setStatus("ready");
      setMessage("Signed in securely. Database Row Level Security controls which school records you can view.");
    }
    void verifyAccess();
    return () => { activeEffect = false; };
  }, [router]);

  useEffect(() => {
    if (status === "ready") void loadRows(active);
  }, [status, active, loadRows]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/portal/");
  }

  const columns = preferredColumns[active] ?? [];
  const rowsToShow = rows.slice(0, 100);

  return (
    <main className="auth-page dashboard-page">
      <section className="auth-card dashboard-card dashboard-wide">
        <p className="eyebrow">ROYAL JUNIOR SCHOOL · KIMILILI</p>
        <h1>School management</h1>
        {status === "loading" ? <p className="auth-note">{message}</p> : (
          <>
            {profile && <p className="auth-status">Welcome, <strong>{profile.full_name || "School user"}</strong>.</p>}
            {profile && <p className="auth-status">Role: <strong>{profile.role}</strong> · Account: <strong>{profile.approval_status}</strong></p>}
            <p className="auth-message" role="status">{message}</p>
            {status === "ready" && profile && (
              <>
                <div className="dashboard-heading">
                  <h2>School portal modules</h2>
                  <p>Choose a section below. Records are loaded from the school database and filtered by your approved role.</p>
                </div>
                <nav className="module-nav" aria-label="School portal sections">
                  {visibleModules.map(key => (
                    <button key={key} type="button" className={active === key ? "module-tab active" : "module-tab"} onClick={() => setActive(key)}>
                      {moduleInfo[key].title}
                    </button>
                  ))}
                </nav>
                {active === "overview" ? (
                  <div className="module-overview">
                    <h3>Welcome to the school management portal</h3>
                    <p>Manage learning, learner welfare and school administration from the sections above.</p>
                    <div className="module-tiles">
                      {visibleModules.filter(key => key !== "overview").map(key => (
                        <button key={key} type="button" className="module-tile" onClick={() => setActive(key)}>
                          <strong>{moduleInfo[key].title}</strong><span>{moduleInfo[key].description}</span><em>Open section →</em>
                        </button>
                      ))}
                    </div>
                    <p className="cbe-note"><strong>CBE focus:</strong> Record continuous assessment and learner progress across learning areas, alongside attendance and teacher feedback. This portal uses CBE terminology.</p>
                  </div>
                ) : (
                  <section className="module-panel">
                    <div className="module-panel-heading">
                      <div><h3>{moduleInfo[active].title}</h3><p>{moduleInfo[active].description}</p></div>
                      <button type="button" className="refresh-button" onClick={() => void loadRows(active)}>Refresh</button>
                    </div>
                    {loadingRows ? <p className="auth-note">Loading school records…</p> : dataMessage ? <p className="module-empty" role="status">{dataMessage}</p> : (
                      <div className="table-scroll">
                        <table className="school-data-table">
                          <thead><tr>{columns.map(column => <th key={column}>{column.replaceAll("_", " ")}</th>)}</tr></thead>
                          <tbody>{rowsToShow.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map(column => <td key={column}>{displayValue(row[column])}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    )}
                    <p className="module-security">Showing up to 100 records allowed by Supabase Row Level Security. Sensitive records are not exposed to unauthorised users.</p>
                  </section>
                )}
              </>
            )}
            <button className="auth-button" onClick={signOut}>Sign out</button>
          </>
        )}
      </section>
    </main>
  );
}
