"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  role: "admin" | "director" | "headteacher" | "bursar" | "teacher" | "parent" | "student";
  approval_status: "pending" | "approved" | "rejected";
};

export default function PortalPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadProfile(session: Session): Promise<Profile | null> {
    setSignedInEmail(session.user.email ?? "");
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role, approval_status")
      .eq("id", session.user.id)
      .single();

    if (error) {
      setMessage("Your login is active, but the school profile could not be loaded. Please contact the school administrator.");
      return null;
    }

    setSignedInEmail(session.user.email ?? "");
    setProfile(data as Profile);
    if (data.approval_status === "pending") {
      setMessage("Your account is waiting for school approval. Learner records remain locked until approval.");
    } else if (data.approval_status === "rejected") {
      setMessage("This account has not been approved for the school portal. Please contact the school office.");
    } else {
      setMessage("Your account is approved. Open your protected school dashboard to continue.");
    }
    return data as Profile;
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void loadProfile(data.session);
    });

    return () => {
      active = false;
    };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error("No active session was returned. Please try again.");
      const currentProfile = await loadProfile(data.session);
      if (currentProfile?.approval_status === "approved") router.push("/portal/dashboard/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      return;
    }
    setSignedInEmail("");
    setProfile(null);
    setPassword("");
    setMessage("You have signed out.");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="auth-back" href={process.env.NODE_ENV === "production" ? "/Royal-Junior-School-Kimilili/" : "/"}>← Back to school website</a>
        <p className="eyebrow">ROYAL JUNIOR SCHOOL · KIMILILI</p>
        <h1>School portal</h1>
        {signedInEmail ? (
          <>
            <p className="auth-status">Signed in as <strong>{profile?.full_name || signedInEmail}</strong>.</p>
            {profile && <p className="auth-status">Role: <strong>{profile.role}</strong> · Account: <strong>{profile.approval_status}</strong></p>}
            <p className="auth-message" role="status">{message}</p>
            {profile?.approval_status === "approved" && <button className="auth-button" onClick={() => router.push("/portal/dashboard/")}>Open dashboard</button>}
            <button className="auth-button" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <form onSubmit={signIn}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
            <button className="auth-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
        )}
        {!signedInEmail && message && <p className="auth-message" role="status">{message}</p>}
        <p className="auth-note">Accounts are issued by the school. New accounts remain pending until approved by an administrator.</p>
      </section>
    </main>
  );
}
