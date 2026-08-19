"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/v1/profile");
        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.error?.message ?? "Failed to load profile.");
          return;
        }

        setProfile(result.profile);
        setForm({
          firstName: result.profile.firstName,
          lastName: result.profile.lastName,
          phone: result.profile.phone || "",
        });
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error?.message ?? "Failed to update profile.");
        return;
      }

      setProfile(result.profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <div className="text-center">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Account</p>
            <h1 className="mt-2 text-3xl font-semibold">Profile settings</h1>
          </div>
          <Link href="/dashboard" className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm">
            Back to dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">First name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Last name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-400"
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Member since</label>
              <input
                type="text"
                value={profile ? new Date(profile.createdAt).toLocaleDateString() : ""}
                disabled
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-400"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-amber-500 px-5 py-3 font-medium text-slate-950 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
