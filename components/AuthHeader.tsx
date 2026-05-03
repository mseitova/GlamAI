import Link from "next/link";

export default function AuthHeader() {
  return (
    <nav className="flex items-center justify-between py-6">
      <Link href="/" className="flex items-center gap-2.5" aria-label="На главную">
        <span className="font-display text-2xl font-medium tracking-tight text-ink-900">
          Smile
        </span>
        <span className="label !text-[9px] mt-1">Colour Index</span>
      </Link>
      <Link href="/" className="label hover:text-ink-900 transition">
        ← На главную
      </Link>
    </nav>
  );
}
