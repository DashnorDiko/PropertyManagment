"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ManagerLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setError(payload.message ?? "Nuk u arrit të bëhet hyrja.");
        return;
      }

      router.replace("/status");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-[var(--pm-border)]/70 bg-[var(--pm-surface)] p-6 shadow-[0_8px_10px_-6px_rgba(69,81,92,0.12),0_20px_25px_-8px_rgba(69,81,92,0.12)]"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--pm-text-secondary)]">
          Username
        </label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          className="w-full rounded-xl border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3.5 py-2.5 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:border-[var(--pm-accent)]/40 focus:bg-[var(--pm-surface)] focus:ring"
          placeholder="manager"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--pm-text-secondary)]">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="w-full rounded-xl border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3.5 py-2.5 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:border-[var(--pm-accent)]/40 focus:bg-[var(--pm-surface)] focus:ring"
          required
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-[var(--pm-danger-soft)] px-3 py-2 text-sm text-[var(--pm-danger-strong)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--pm-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Duke hyrë..." : "Hyr në panel"}
      </button>
    </form>
  );
}
