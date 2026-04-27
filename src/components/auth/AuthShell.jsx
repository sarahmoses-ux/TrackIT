import { ArrowRight, ChartColumnIncreasing, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  "Inventory visibility across fast-moving products",
  "Daily sales logging without spreadsheet stress",
  "AI-backed insight cards tailored for small teams",
];

const stats = [
  { label: "Retail teams onboarded", value: "2,400+" },
  { label: "Average hours saved weekly", value: "11 hrs" },
  { label: "Monthly sales tracked", value: "₦120M+" },
];

export default function AuthShell({ children, footer, subtitle, title }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,122,74,0.8),transparent_35%),linear-gradient(160deg,#0f172a_0%,#166534_55%,#0b3f25_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="relative z-10">
          <Link className="inline-flex items-center gap-2 font-display text-2xl font-extrabold" to="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <ChartColumnIncreasing className="h-5 w-5" />
            </span>
            TrackIt
          </Link>
          <h1 className="mt-12 max-w-xl font-display text-5xl font-extrabold leading-tight">
            Smart sales tracking built for ambitious Nigerian businesses.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-emerald-50/90">
            Replace paper ledgers and scattered chats with one polished workspace for stock,
            sales, forecasts, and exports.
          </p>
          <div className="mt-8 space-y-4">
            {highlights.map((item) => (
              <div key={item} className="glass-chip flex items-center gap-3 px-4 py-3 text-sm text-slate-900">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-10 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="font-display text-3xl font-bold">{stat.value}</p>
                <p className="mt-2 text-sm text-white/75">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            Everything saves locally for now, so you can test the full flow instantly.
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-xl">
          <div className="mb-8 lg:hidden">
            <Link className="font-display text-3xl font-extrabold text-primary" to="/">
              TrackIt
            </Link>
            <p className="mt-3 text-base text-muted">
              Stock, sales, and AI guidance for growing businesses.
            </p>
          </div>
          <div className="panel-card rounded-[28px] p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                TrackIt Access
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold text-text">{title}</h2>
              <p className="mt-3 text-base text-muted">{subtitle}</p>
            </div>
            {children}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted">
              <span>{footer}</span>
              <Link className="inline-flex items-center gap-2 font-semibold text-primary" to="/">
                Back to home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
