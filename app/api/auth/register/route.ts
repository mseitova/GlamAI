import { NextRequest, NextResponse } from "next/server";
import { registerUser, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; name?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const { email, name, password } = body;
  if (typeof email !== "string" || typeof name !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Заполни все поля" }, { status: 400 });
  }

  const result = await registerUser({ email, name, password });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  setSessionCookie(result.user.id);
  return NextResponse.json({ user: result.user });
}
