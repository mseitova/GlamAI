"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import AuthHeader from "@/components/AuthHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const valid =
    name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 8;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось зарегистрироваться");
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
      <AuthHeader />
      <div className="hairline" />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-12 gap-x-6 py-16 md:py-24"
      >
        <div className="col-span-12 md:col-span-2">
          <p className="label">
            Account
            <br />
            <span className="text-ink-900 font-medium tabular">01 / 03</span>
          </p>
        </div>

        <div className="col-span-12 md:col-span-10">
          <h1 className="font-display text-display-md font-light text-ink-900 mb-2">
            Создай <span className="italic text-ink-500">аккаунт</span>
          </h1>
          <p className="text-ink-600 mb-12 max-w-md">
            Чтобы сохранять результаты анализа и возвращаться к своей палитре.
          </p>

          <Field
            label="Имя"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Анна"
            autoComplete="name"
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Пароль"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="минимум 8 символов"
            autoComplete="new-password"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-sm text-accent"
            >
              {error}
            </motion.p>
          )}

          <div className="flex items-center gap-6 mt-12">
            <button
              type="submit"
              disabled={!valid || loading}
              className="btn btn-primary"
            >
              {loading ? "Создаём…" : "Зарегистрироваться"}
              <span aria-hidden>→</span>
            </button>
            <Link href="/login" className="link text-sm">
              Уже есть аккаунт
            </Link>
          </div>
        </div>
      </motion.form>

      <footer className="hairline pt-6 mt-20 flex items-center justify-between text-ink-400">
        <p className="label">© 2026 · Smile · Colour Index No. 01</p>
        <p className="label">Powered by GPT-4o</p>
      </footer>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete
}: {
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="hairline pt-6 mt-8 first:mt-0 first:pt-0 first:border-0">
      <p className="label mb-3">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-0 border-b border-ink-100 focus:border-ink-700 focus:outline-none py-2 text-base placeholder:text-ink-300"
      />
    </div>
  );
}
