import { getSessionUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard.service";
import Link from "next/link";

export default async function TransactionsPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h1 className="text-2xl font-semibold">Session required</h1>
          <p className="mt-2 text-slate-300">Please sign in to view your transactions.</p>
          <Link href="/login" className="mt-6 inline-block rounded-full bg-amber-500 px-5 py-2 font-medium text-slate-950">Sign in</Link>
        </div>
      </main>
    );
  }

  const data = await getDashboardData(user.id);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Transactions</p>
            <h1 className="mt-2 text-3xl font-semibold">Payment activity</h1>
          </div>
          <Link href="/dashboard" className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200">Back to dashboard</Link>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          {data.recentTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">No transaction history available yet.</div>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => {
                const isCredit = transaction.receiverUserId === user.id;

                return (
                  <div key={transaction.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div>
                      <div className="font-medium text-slate-100">{transaction.type}</div>
                      <div className="text-xs text-slate-400">{new Date(transaction.createdAt).toLocaleString()}</div>
                    </div>
                    <div className={`font-medium ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                      {isCredit ? "+" : "-"}R{Number(transaction.amount.toString()).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
