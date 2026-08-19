import { getSessionUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard.service";
import Link from "next/link";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h1 className="text-2xl font-semibold">Session required</h1>
          <p className="mt-2 text-slate-300">Please sign in to access your VaultPay dashboard.</p>
          <Link href="/login" className="mt-6 inline-block rounded-full bg-cyan-500 px-5 py-2 font-medium text-slate-950">Sign in</Link>
        </div>
      </main>
    );
  }

  const data = await getDashboardData(user.id);

  return (
    <main className="min-h-screen px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-[0.16em] text-amber-300">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-sm text-zinc-950">V</span>
              VAULTPAY
            </div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Personal dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Good to see you, {user.firstName}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/profile" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:border-amber-400/50 hover:text-white">
              Account settings
            </Link>
            <div className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400 md:block">{user.email}</div>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr_0.85fr]">
          <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-[#31372b] to-[#19211d] p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between text-sm text-zinc-300"><span>Available balance</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-amber-200">ZAR</span></div>
            <div className="mt-5 text-4xl font-semibold tracking-tight">R{data.totalBalance.toFixed(2)}</div>
            <div className="mt-8 text-sm text-zinc-400">Across {data.accounts.length} active account{data.accounts.length === 1 ? "" : "s"}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <div className="text-sm text-zinc-400">Ledger balance</div>
            <div className="mt-5 text-3xl font-semibold">R{data.ledgerBalance.toFixed(2)}</div>
            <div className="mt-8 text-xs uppercase tracking-[0.16em] text-emerald-300">Up to date</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <div className="text-sm text-zinc-400">Accounts</div>
            <div className="mt-5 text-3xl font-semibold">{data.accounts.length}</div>
            <div className="mt-8 text-xs uppercase tracking-[0.16em] text-zinc-500">Active wallets</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link href="/dashboard/actions" className="group rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-5 text-left hover:border-amber-300/60">
            <div className="text-sm text-amber-300">Transfer <span className="float-right text-lg transition-transform group-hover:translate-x-1">→</span></div>
            <div className="mt-3 font-medium">Send money to another VaultPay user</div>
          </Link>
          <Link href="/dashboard/actions" className="group rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-5 text-left hover:border-emerald-300/50">
            <div className="text-sm text-emerald-300">Deposit <span className="float-right text-lg transition-transform group-hover:translate-x-1">→</span></div>
            <div className="mt-3 font-medium">Top up your wallet balance</div>
          </Link>
          <Link href="/dashboard/actions" className="group rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-5 text-left hover:border-rose-300/50">
            <div className="text-sm text-rose-300">Withdrawal <span className="float-right text-lg transition-transform group-hover:translate-x-1">→</span></div>
            <div className="mt-3 font-medium">Move money out of your wallet</div>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent transactions</h2>
              <Link href="/dashboard/transactions" className="text-sm text-amber-300">View all</Link>
            </div>
            <div className="space-y-3">
              {data.recentTransactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">No transactions found yet.</div>
              ) : (
                data.recentTransactions.map((transaction) => {
                  const isCredit = transaction.receiverUserId === user.id;

                  return (
                    <div key={transaction.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                      <div>
                        <div className="font-medium text-slate-100">{transaction.type}</div>
                        <div className="text-xs text-slate-400">{new Date(transaction.createdAt).toLocaleString()}</div>
                      </div>
                      <div className={`font-medium ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isCredit ? "+" : "-"}R{Number(transaction.amount.toString()).toFixed(2)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="mt-4 space-y-3">
              {data.notifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">No notifications yet.</div>
              ) : (
                data.notifications.map((notification) => (
                  <div key={notification.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                    <div className="font-medium text-slate-100">{notification.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{notification.body}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
