import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Leaf, Lock, ShieldCheck, Sprout, User } from "lucide-react";
import heroImage from "@/assets/login-hero.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · BellPepper AI" },
      { name: "description", content: "Sign in to BellPepper AI — intelligent crop inspection and polyhouse monitoring." },
      { property: "og:title", content: "Sign in · BellPepper AI" },
      { property: "og:description", content: "Intelligent crop inspection and polyhouse monitoring." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      <img
        src={heroImage}
        alt="Bell pepper plants inside a modern polyhouse with an inspection rover"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,var(--primary)_0%,color-mix(in_oklab,var(--primary)_88%,black)_45%,color-mix(in_oklab,var(--primary)_55%,transparent)_100%)] opacity-95" />

      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-white/15 px-6 py-4 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/12 text-white ring-1 ring-white/25">
              <Leaf className="size-5" />
            </span>
            <div className="leading-tight text-white">
              <p className="text-[15px] font-semibold tracking-tight">BellPepper AI</p>
              <p className="text-[12px] text-white/70">Rover Management &amp; Monitoring System</p>
            </div>
          </div>
          <span className="hidden items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[12px] text-white/85 ring-1 ring-white/20 sm:inline-flex">
            <ShieldCheck className="size-3.5" /> Secure access
          </span>
        </header>

        <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-12 lg:grid-cols-[1.05fr_minmax(0,420px)] lg:px-12">
          <section className="hidden text-white lg:block">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[12px] ring-1 ring-white/20">
              <Sprout className="size-3.5" /> AI Agriculture Platform
            </span>
            <h2 className="mt-6 max-w-xl text-[42px] font-semibold leading-[1.1] tracking-tight">
              Intelligent crop inspection for every polyhouse.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80">
              Track rover inspections, disease detections, soil intelligence and yield trends —
              in one calm, unified control centre.
            </p>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { k: "Polyhouses", v: "12" },
                { k: "Plants tracked", v: "18.4k" },
                { k: "Inspection accuracy", v: "98.2%" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                  <dd className="text-[22px] font-semibold">{s.v}</dd>
                  <dt className="mt-0.5 text-[12px] text-white/70">{s.k}</dt>
                </div>
              ))}
            </dl>
          </section>

          <section className="w-full justify-self-center rounded-3xl bg-card p-7 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55)] sm:p-8">
            <span className="block h-1 w-12 rounded-full bg-saffron" />
            <h1 className="mt-5 text-[24px] font-semibold tracking-tight text-foreground">Sign in</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Use your registered credentials to continue.
            </p>

            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                setTimeout(() => navigate({ to: "/" }), 600);
              }}
            >
              <div>
                <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground" htmlFor="email">
                  Email / User ID
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    defaultValue="aman@bellpepper.ai"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3.5 text-[14px] outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf-soft"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    defaultValue="password"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-10 text-[14px] outline-none transition-colors focus:border-leaf focus:ring-2 focus:ring-leaf-soft"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="size-3.5 accent-[var(--leaf)]" /> Remember me
                </label>
                <button type="button" className="font-medium text-leaf hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>

            <p className="mt-6 border-t border-border pt-5 text-center text-[12px] leading-relaxed text-muted-foreground">
              Access is restricted to authorised farm operators and administrators.
            </p>
          </section>
        </main>

        <footer className="px-6 pb-6 text-center text-[12px] text-white/65 lg:px-12">
          © 2026 BellPepper AI · Smart Polyhouse Monitoring
        </footer>
      </div>
    </div>
  );
}
