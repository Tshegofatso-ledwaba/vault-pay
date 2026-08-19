"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardActionsPage() {
  const [activeTab, setActiveTab] = useState<"transfer" | "deposit" | "withdrawal">("transfer");
  const [amount, setAmount] = useState("2500");
  const [recipient, setRecipient] = useState("customer@vaultpay.demo");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/v1/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activeTab,
          amount: Number(amount),
          recipientEmail: activeTab === "transfer" ? recipient : undefined,
          note,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Transaction failed");
      }

      setMessageType("success");
      setMessage(`${activeTab} completed successfully.`);
      setAmount("2500");
      setRecipient("customer@vaultpay.demo");
      setNote("");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Transaction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Wallet actions</p>
            <h1 className="mt-2 text-3xl font-semibold">Move money</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:border-amber-400/50 hover:text-white">Back to dashboard</Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-8 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/15 p-1.5">
            {(["transfer", "deposit", "withdrawal"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-3 py-2 text-sm font-medium capitalize ${
                  activeTab === tab ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10" : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Amount (ZAR)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-zinc-100 outline-none focus:border-amber-400/70"
              />
            </div>

            {activeTab === "transfer" ? (
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Recipient email</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-zinc-100 outline-none focus:border-amber-400/70"
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Reference or note</label>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-zinc-100 outline-none focus:border-amber-400/70"
                placeholder="Optional memo"
              />
            </div>

            <button type="submit" disabled={loading} className="rounded-xl bg-amber-400 px-5 py-3 font-medium text-slate-950 shadow-lg shadow-amber-400/10 disabled:opacity-60">
              {loading ? "Processing..." : `${activeTab.charAt(0).toUpperCase()}${activeTab.slice(1)}`}
            </button>
          </form>

          {message ? (
            <div className={`mt-4 rounded-xl border px-3 py-2 text-sm ${messageType === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}>
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
