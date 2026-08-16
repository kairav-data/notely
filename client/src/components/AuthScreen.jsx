import { useState } from "react";
import { ArrowRight, Check, FileText, LockKeyhole, Sparkles } from "lucide-react";
import { api } from "../api.js";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "", company: "", jobTitle: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = isLogin
        ? await api.login(email, password)
        : await api.register({ email, password, ...profile });
      localStorage.setItem("notely-token", result.token);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === "login";
  const updateProfile = (field) => (event) => setProfile((current) => ({ ...current, [field]: event.target.value }));
  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-hidden="true">
        <div className="auth-showcase__brand"><span className="auth-mark"><FileText size={20} /></span> Notely</div>
        <div className="auth-orb auth-orb--one" /><div className="auth-orb auth-orb--two" />
        <div className="auth-showcase__content">
          <span className="auth-kicker"><Sparkles size={14} /> A calmer way to think</span>
          <h1>Your ideas,<br /><em>beautifully</em> yours.</h1>
          <p>A private, spacious workspace for the thoughts worth keeping.</p>
          <ul><li><Check size={16} /> Private notes for every account</li><li><Check size={16} /> Rich canvas and whiteboard tools</li><li><Check size={16} /> Available wherever you work</li></ul>
        </div>
        <div className="auth-showcase__footer">© {new Date().getFullYear()} Notely</div>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-mobile-brand"><span className="auth-mark"><FileText size={18} /></span> Notely</div>
          <div className="auth-heading"><span>{isLogin ? "Welcome back" : "Start your workspace"}</span><h2>{isLogin ? "Sign in to Notely" : "Create your account"}</h2><p>{isLogin ? "Use your email to continue to your notes." : "A few details, then your private space is ready."}</p></div>
          {!isLogin && <div className="auth-name-row"><label>First name<input value={profile.firstName} onChange={updateProfile("firstName")} autoComplete="given-name" minLength="2" required /></label><label>Last name<input value={profile.lastName} onChange={updateProfile("lastName")} autoComplete="family-name" minLength="2" required /></label></div>}
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          {!isLogin && <label>Phone number<input type="tel" value={profile.phone} onChange={updateProfile("phone")} autoComplete="tel" placeholder="+91 98765 43210" required /></label>}
          {!isLogin && <details className="auth-details"><summary>Add work details <span>(optional)</span></summary><div><label>Company<input value={profile.company} onChange={updateProfile("company")} autoComplete="organization" /></label><label>Job title<input value={profile.jobTitle} onChange={updateProfile("jobTitle")} autoComplete="organization-title" /></label></div></details>}
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isLogin ? "current-password" : "new-password"} minLength="8" placeholder={isLogin ? "Your password" : "At least 8 characters"} required /></label>
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : <>{isLogin ? "Sign in" : "Create account"}<ArrowRight size={17} /></>}</button>
          <p className="auth-switch">{isLogin ? "New to Notely?" : "Already have an account?"} <button type="button" onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); }}>{isLogin ? "Create one" : "Sign in"}</button></p>
          <div className="auth-security"><LockKeyhole size={13} /> Your password is securely hashed and never stored as plain text.</div>
        </form>
      </section>
    </main>
  );
}
