"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PortalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSignedInEmail(data.user.email ?? email);
      setMessage("Sign-in succeeded. School records remain unavailable until your account is approved and the database access policies are installed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSignedInEmail("");
    setPassword("");
    setMessage("You have signed out.");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="auth-back" href="/">← Back to school website</a>
        <p className="eyebrow">ROYAL JUNIOR SCHOOL · KIMILILI</p>
        <h1>School portal</h1>
        {signedInEmail ? (
          <>
            <p className="auth-status">Signed in as <strong>{signedInEmail}</strong>.</p>
            <p className="auth-note">Your dashboard will appear once the school account approval and row-level access setup is completed. No learner records are exposed on this page.</p>
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
        {message && <p className="auth-message" role="status">{message}</p>}
        <p className="auth-note">Accounts are issued or approved by the school. Self-registration is not enabled yet.</p>
      </section>
    </main>
  );
}
