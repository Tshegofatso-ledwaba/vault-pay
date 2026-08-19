import Link from "next/link";

const features = [
  "Multi-account wallet management",
  "Real-time transfers and balance updates",
  "MFA, audit trails, and fraud checks",
  "Admin compliance dashboards and reports",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <nav className="mb-16 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">VAULTPAY</div>
          <div className="flex gap-4 text-sm text-zinc-300">
            <Link href="/login" className="rounded-full border border-zinc-700 px-4 py-2 hover:bg-zinc-800">Sign in</Link>
            <Link href="/register" className="rounded-full bg-amber-500 px-4 py-2 font-medium text-slate-950 hover:bg-amber-400">Get started</Link>
          </div>
        </nav>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Secure digital wallet
            </span>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white md:text-6xl">
              Modern money movement for growing businesses and people.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              VaultPay gives customers, finance teams, and support staff a trusted place to move money, review balances, manage risk, and track transactions with full audit visibility.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/register" className="rounded-full bg-amber-500 px-6 py-3 font-medium text-slate-950 hover:bg-amber-400">Get Started</Link>
              <Link href="/login" className="rounded-full border border-slate-700 px-6 py-3 font-medium text-white hover:bg-slate-900">Sign In</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-amber-500/10">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-sm text-zinc-400">Total balance</div>
                <div className="mt-2 text-3xl font-semibold">R184,250.40</div>
                <div className="mt-2 text-sm text-emerald-400">+8.4% this month</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-sm text-zinc-400">Incoming</div>
                  <div className="mt-2 text-xl font-semibold text-emerald-400">R42,100</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-sm text-zinc-400">Outgoing</div>
                  <div className="mt-2 text-xl font-semibold text-rose-400">R18,760</div>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="mb-3 text-sm text-zinc-400">Recent activity</div>
                <div className="space-y-3 text-sm text-zinc-300">
                  <div className="flex items-center justify-between"><span>Transfer to Northstar</span><span className="text-emerald-400">+R3,500</span></div>
                  <div className="flex items-center justify-between"><span>Withdraw to card</span><span className="text-rose-400">-R820</span></div>
                  <div className="flex items-center justify-between"><span>Deposit from payroll</span><span className="text-emerald-400">+R6,900</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-200">
              <div className="mb-4 h-10 w-10 rounded-xl bg-amber-500/15" />
              <p className="text-lg font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
