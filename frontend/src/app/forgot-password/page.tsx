"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("customer@vaultpay.demo");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl shadow-amber-500/10">
        <div className="mb-6 text-center">
          <div className="text-2xl font-bold tracking-tight">VAULTPAY</div>
          <h1 className="mt-4 text-3xl font-semibold">Reset password</h1>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            A reset link has been queued for {email}. Check your inbox to continue.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-slate-300">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-0 focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 px-4 py-3 font-medium text-slate-950"
            >
              Send reset link
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="text-amber-300">Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}
