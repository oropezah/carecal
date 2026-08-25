import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { C, FONT_DISPLAY, FONT_BODY, EASE_OUT } from "@/lib/carecalTheme";
import CareCalGlassStyles from "@/components/CareCalGlassStyles";
import { AmbientGlow, Field } from "@/components/CareCalUI";

type SimpleAuthGuardProps = {
  children: ReactNode;
};

export default function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { authenticated: boolean }) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Invalid credentials. Please try again.");
      return;
    }

    setAuthenticated(true);
  }

  const shellStyle = {
    background: `radial-gradient(1200px 600px at 50% -10%, ${C.bgSecondary}, ${C.bgPrimary} 60%)`,
    fontFamily: FONT_BODY,
    color: C.textPrimary,
  };

  if (checking) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center" style={shellStyle}>
        <CareCalGlassStyles />
        <AmbientGlow />
        <div className="relative z-10 h-10 w-10 rounded-full border-[2.5px] border-emerald-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12" style={shellStyle}>
        <CareCalGlassStyles />
        <AmbientGlow />
        <div
          className="carecal-glass relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8"
          style={{ animation: `carecalPopIn 300ms ${EASE_OUT} both` }}
        >
          <p
            className="text-[10px] uppercase text-center"
            style={{ letterSpacing: "0.45em", color: C.accentDark, fontFamily: FONT_DISPLAY, fontWeight: 600 }}
          >
            CareCal Admin
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl text-center font-semibold" style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}>
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm text-center" style={{ color: C.textSecondary }}>
            Enter your admin credentials to access the setup wizard.
          </p>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
            <Field label="Admin Email" error={null}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@carecal.com"
                autoComplete="username"
                required
                className="mt-2 w-full bg-transparent pb-2 text-base outline-none"
                style={{ borderBottom: `1.5px solid ${C.border}`, color: C.textPrimary }}
              />
            </Field>
            <Field label="Password" error={error}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="mt-2 w-full bg-transparent pb-2 text-base outline-none"
                style={{ borderBottom: `1.5px solid ${error ? C.error : C.border}`, color: C.textPrimary }}
              />
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="carecal-shine w-full rounded-xl py-4 text-base disabled:cursor-not-allowed"
              style={{
                backgroundColor: submitting ? "rgba(16,185,129,0.15)" : C.accent,
                color: submitting ? "rgba(15,23,42,0.35)" : "#FFFFFF",
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                letterSpacing: "0.04em",
                boxShadow: submitting ? "none" : `0 18px 40px -20px ${C.glow}`,
              }}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
