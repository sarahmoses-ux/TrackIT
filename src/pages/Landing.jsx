import {
  ArrowRight,
  Check,
  ChartColumnIncreasing,
  ChevronDown,
  FileDown,
  LayoutDashboard,
  Menu,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import clsx from "../components/utils/clsx";

const problems = [
  {
    description: "Paper ledgers and scattered chats slow down the workday.",
    icon: LayoutDashboard,
    title: "Manual tracking is slow",
  },
  {
    description: "Stock-outs mean missed customers and urgent supplier calls.",
    icon: TriangleAlert,
    title: "Stock-outs lose sales",
  },
  {
    description: "Without clear reports, profit decisions become guesswork.",
    icon: TrendingUp,
    title: "No visibility into profit",
  },
];

const features = [
  {
    description: "Add, edit, search, and monitor products with stock-aware badges.",
    icon: Package,
    title: "Inventory Management",
  },
  {
    description: "Log transactions in seconds and update stock automatically.",
    icon: ShoppingCart,
    title: "Sales Logging",
  },
  {
    description: "See future profit signals based on your recent performance.",
    icon: Sparkles,
    title: "AI Profit Forecasting",
  },
  {
    description: "Surface low-stock items before they hurt daily sales.",
    icon: TriangleAlert,
    title: "Low-Stock Alerts",
  },
  {
    description: "Spot your top products and watch sales patterns over time.",
    icon: ChartColumnIncreasing,
    title: "Sales Trend Reports",
  },
  {
    description: "Download clean CSV exports or save printable report views.",
    icon: FileDown,
    title: "CSV/PDF Export",
  },
];

const testimonials = [
  {
    business: "Boutique owner, Lagos",
    name: "Adaeze",
    quote: "TrackIt helped me stop guessing. I can see my fast movers and reorder before weekends get hectic.",
  },
  {
    business: "Phone accessories seller, Abuja",
    name: "Emeka",
    quote: "Sales logging is quick, and the dashboard makes daily performance obvious for my small team.",
  },
  {
    business: "Mini-mart operator, Kano",
    name: "Fatima",
    quote: "The low-stock alerts alone saved us from losing repeat customers to empty shelves.",
  },
];

const plans = [
  {
    cta: "Start Free",
    features: ["Inventory tracking", "Sales logging", "Dashboard analytics", "Single user access"],
    price: "₦0",
    title: "Free",
  },
  {
    cta: "Choose Pro",
    features: ["Everything in Free", "AI insights", "Multi-user access", "CSV and printable reports"],
    popular: true,
    price: "₦2,499",
    title: "Pro",
  },
];

const footerGroups = [
  { heading: "Product", links: ["Features", "Pricing", "Reports", "Insights"] },
  { heading: "Company", links: ["About", "Customers", "Partners", "Contact"] },
  { heading: "Support", links: ["Help Center", "Privacy", "Terms", "Status"] },
];

function HeroMockup() {
  return (
    <div className="relative hidden w-full max-w-[560px] self-center lg:block">
      <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-6 bottom-8 h-32 w-32 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="relative rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex items-center justify-between rounded-3xl bg-slate-950 px-5 py-4 text-white">
          <div>
            <p className="text-sm text-white/70">Revenue this month</p>
            <p className="mt-2 font-display text-3xl font-bold">₦412,000</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
            <p className="text-xs text-white/65">Low stock</p>
            <p className="mt-1 text-xl font-semibold">3 items</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-border bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-text">Weekly sales</h3>
              <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                +14%
              </span>
            </div>
            <div className="mt-6 flex h-40 items-end gap-3">
              {["h-16", "h-24", "h-20", "h-32", "h-28", "h-36", "h-40"].map((height) => (
                <div key={height} className="flex-1 rounded-t-2xl bg-primary/90">
                  <div className={clsx("w-full rounded-t-2xl bg-primary", height)} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-white p-4">
              <p className="text-sm text-muted">Top product</p>
              <p className="mt-2 font-display text-lg font-semibold text-text">Urban Sneakers</p>
              <p className="mt-1 text-sm text-primary">₦84,000 revenue</p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Restock soon</p>
              <p className="mt-2 text-sm text-amber-800">Chocolate Granola Jar has only 6 units left.</p>
            </div>
            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">AI forecast</p>
              <p className="mt-2 text-sm text-blue-800">Profit expected to rise 11% over the next 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(
    () => [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How It Works" },
      { href: "#pricing", label: "Pricing" },
    ],
    [],
  );

  return (
    <div className="bg-white text-text">
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "border-b border-border bg-white/90 shadow-sm backdrop-blur" : "bg-transparent",
        )}
      >
        <div className="section-shell">
          <div className="flex h-20 items-center justify-between">
            <Link className="font-display text-3xl font-extrabold text-primary" to="/">
              TrackIt
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((item) => (
                <a key={item.href} className="text-sm font-medium text-slate-700 hover:text-primary" href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started Free</Button>
              </Link>
            </div>
            <button
              aria-label="Toggle menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white md:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          <div
            className={clsx(
              "overflow-hidden transition-all duration-300 md:hidden",
              menuOpen ? "max-h-72 pb-4 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="rounded-3xl border border-border bg-white p-4 shadow-card">
              <div className="space-y-2">
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-text hover:bg-primary-light"
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                <Link to="/login">
                  <Button className="w-full" variant="ghost">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full">Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-mesh grid-overlay pt-28">
          <div className="section-shell grid min-h-[90vh] gap-14 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <div className="glass-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4 text-primary" />
                2,400+ businesses trust TrackIt
              </div>
              <h1 className="mt-8 max-w-2xl font-display text-5xl font-extrabold leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Run Your Business Smarter
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Track inventory, record sales, and get AI-powered insights built for Nigerian
                small businesses.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/register">
                  <Button className="w-full sm:w-auto" size="lg">
                    Start for Free
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button className="w-full sm:w-auto" size="lg" variant="outline">
                    See How It Works
                  </Button>
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-3">
                  {["A", "E", "F", "M"].map((label) => (
                    <div
                      key={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-emerald-100 font-semibold text-primary"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-text">2,400+ businesses trust TrackIt</p>
                  <p className="text-sm text-muted">Built for boutiques, kiosks, and modern retail teams.</p>
                </div>
              </div>
            </div>
            <HeroMockup />
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="section-shell grid gap-6 md:grid-cols-3">
            {problems.map(({ description, icon: Icon, title }) => (
              <div key={title} className="rounded-3xl border border-border bg-white p-6 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 font-display text-2xl font-semibold text-text">{title}</h2>
                <p className="mt-3 text-base leading-7 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20" id="features">
          <div className="section-shell">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Features</p>
              <h2 className="mt-4 font-display text-4xl font-bold text-text">Everything you need to grow</h2>
              <p className="mt-4 text-lg text-muted">
                One workspace for stock control, sales activity, and insight-driven decisions.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map(({ description, icon: Icon, title }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border bg-white p-6 shadow-card transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-text">{title}</h3>
                  <p className="mt-3 text-base leading-7 text-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-20 text-white" id="how-it-works">
          <div className="section-shell">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">How It Works</p>
              <h2 className="mt-4 font-display text-4xl font-bold">Simple enough for daily use, powerful enough to scale.</h2>
            </div>
            <div className="mt-14 space-y-8">
              {[
                ["01", "Add your products", "Capture names, prices, SKUs, and stock counts in one clean table."],
                ["02", "Record sales daily", "Log transactions quickly and let inventory update automatically."],
                ["03", "Get AI insights", "Forecast profit and spot low stock before it hurts revenue."],
              ].map(([number, title, description], index) => (
                <div
                  key={number}
                  className={clsx(
                    "grid gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 lg:grid-cols-2 lg:items-center",
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : "",
                  )}
                >
                  <div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                      {number}
                    </div>
                    <h3 className="mt-5 font-display text-3xl font-semibold">{title}</h3>
                    <p className="mt-3 max-w-xl text-base leading-7 text-white/75">{description}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-slate-900/60 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-sm text-white/60">Step focus</p>
                        <p className="mt-2 text-xl font-semibold">{title}</p>
                      </div>
                      <div className="rounded-2xl bg-primary/20 p-4">
                        <p className="text-sm text-emerald-200">Outcome</p>
                        <p className="mt-2 text-xl font-semibold">Less manual stress</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80">
                      <ChevronDown className="h-4 w-4 text-emerald-300" />
                      Daily workflows stay clear even for small teams.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary-light py-20">
          <div className="section-shell">
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.name} className="rounded-3xl border border-primary/10 bg-white p-6 shadow-card">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-base leading-7 text-slate-700">"{item.quote}"</p>
                  <div className="mt-6">
                    <p className="font-display text-xl font-semibold text-text">{item.name}</p>
                    <p className="text-sm text-muted">{item.business}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" id="pricing">
          <div className="section-shell">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
              <h2 className="mt-4 font-display text-4xl font-bold text-text">Simple plans that grow with your business</h2>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  className={clsx(
                    "rounded-[28px] border bg-white p-7 shadow-card",
                    plan.popular ? "border-primary shadow-[0_20px_60px_rgba(26,122,74,0.14)]" : "border-border",
                  )}
                >
                  {plan.popular ? (
                    <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                      Most Popular
                    </span>
                  ) : null}
                  <h3 className="mt-4 font-display text-3xl font-bold text-text">{plan.title}</h3>
                  <p className="mt-3 font-display text-5xl font-extrabold text-text">
                    {plan.price}
                    {plan.title === "Pro" ? <span className="text-base font-medium text-muted">/month</span> : null}
                  </p>
                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link className="mt-8 inline-flex" to="/register">
                    <Button className="w-full" variant={plan.popular ? "primary" : "outline"}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-16">
          <div className="section-shell flex flex-col items-start justify-between gap-6 text-white lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Get Started</p>
              <h2 className="mt-3 font-display text-4xl font-bold">Start tracking for free today</h2>
            </div>
            <Link to="/register">
              <Button className="bg-white text-primary hover:bg-emerald-50" size="lg">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-16 text-white">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <div>
              <Link className="font-display text-3xl font-extrabold text-white" to="/">
                TrackIt
              </Link>
              <p className="mt-4 max-w-sm text-base leading-7 text-slate-300">
                Smart sales tracking for boutiques, kiosks, and growing retail businesses across Nigeria.
              </p>
              <div className="mt-6 flex gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </span>
              </div>
            </div>
            {footerGroups.map((group) => (
              <div key={group.heading}>
                <h3 className="font-display text-xl font-semibold">{group.heading}</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {group.links.map((item) => (
                    <a key={item} href="/" onClick={(event) => event.preventDefault()}>
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-400">
            © {new Date().getFullYear()} TrackIt. Made in Nigeria.
          </div>
        </div>
      </footer>
    </div>
  );
}
