"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Me = { id: string; name: string; email: string } | null;

export default function Nav({ onReset, showReset }: { onReset: () => void; showReset: boolean }) {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setMe(data.user ?? null);
    } catch {
      setMe(null);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
  };

  return (
    <nav className="flex items-center justify-between py-6">
      <button onClick={onReset} className="flex items-center gap-2.5" aria-label="На главную">
        <span className="font-display text-2xl font-medium tracking-tight text-ink-900">
          Smile
        </span>
        <span className="label !text-[9px] mt-1">Colour Index</span>
      </button>

      <div className="flex items-center gap-5">
        {loaded && (
          me ? (
            <>
              <span className="label normal-case tracking-normal !text-[12px] text-ink-700">
                {me.name}
              </span>
              <button onClick={logout} className="label hover:text-ink-900 transition">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="label hover:text-ink-900 transition">
                Войти
              </Link>
              <Link href="/register" className="label hover:text-ink-900 transition">
                Регистрация
              </Link>
            </>
          )
        )}

        {showReset && (
          <button onClick={onReset} className="label hover:text-ink-900 transition">
            ← Заново
          </button>
        )}
      </div>
    </nav>
  );
}
