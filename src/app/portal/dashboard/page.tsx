"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  role: "admin" | "teacher" | "parent";
  approval_status: "pending" | "approved" | "rejected";
};

export default function ProtectedDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "blocked">("loading");
  const [message, setMessage] = useState("Checking your school account…");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function verifyAccess() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/portal/");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, approval_status")
        .eq("id", sessionData.session.user.id)
        .single();

      if (!active) return;
      if (error || !data) {
        setStatus("blocked");
        setMessage("Your school profile could not be verified. Please contact the school administrator.");
        return;
      }

      const account = data as Profile;
      setProfile(account);
      if (account.approval_status !== "approved") {
        setStatus("blocked");
        setMessage(account.approval_status === "pending"
          ? "Your account is awaiting school approval. Dashboard access is locked."
          : "This account has not been approved for school portal access. Please contact the school office.");
        return;
      }

      setStatus("ready");
      setMessage("Your account is approved. Database Row Level Security will restrict every school record to your role and assigned relationships.");
    }

    void verifyAccess();
    return () => {
      active = false;
    };
  }, [router]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/portal/");
  }

  return (
    <main className="auth-page">
      <section className="auth-card dashboard-card">
        <p className="eyebrow">ROYAL JUNIOR SCHOOL · KIMILILI</p>
        <h1>School dashboard</h1>
        {status === "loading" ? (
          <p className="auth-note">{message}</p>
        ) : (
          <>
            {profile && <p className="auth-status">Welcome, <strong>{profile.full_name || "School user"}</strong>.</p>}
            {profile && <p className="auth-status">Role: <strong>{profile.role}</strong> · Account: <strong>{profile.approval_status}</strong></p>}
            <p className="auth-message" role="status">{message}</p>
            {status === "ready" && (
              <div className="dashboard-modules">
                <h2>Portal modules</h2>
                <p className="auth-note">Your protected dashboard shell is active. The next build step is to connect the role-specific school screens to these RLS-protected tables.</p>
                <ul>
                  {profile?.role === "admin" && <><li>Learners and admissions</li><li>Staff and parent approvals</li><li>Classes, subjects and terms</li><li>Fees, payment approvals and receipts</li><li>Attendance, assessments and notices</li></>}
                  {profile?.role === "teacher" && <><li>Assigned classes and learners</li><li>Daily attendance</li><li>Assessments and marks</li><li>Class notices</li></>}
                  {profile?.role === "parent" && <><li>Linked children and learner profiles</li><li>Attendance and report cards</li><li>Fee statements and payment submissions</li><li>School notices</li></>}
                </ul>
              </div>
            )}
            <button className="auth-button" onClick={signOut}>Sign out</button>
          </>
        )}
      </section>
    </main>
  );
}
