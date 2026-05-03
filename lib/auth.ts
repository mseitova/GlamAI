import crypto from "crypto";
import { cookies } from "next/headers";
import { Pool } from "pg";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const COOKIE_NAME = "smile_session";
const SESSION_DAYS = 30;

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL не задан");
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

function getSecret(): string {
  return process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me";
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function makeToken(userId: string): string {
  const issued = Date.now().toString();
  const body = `${userId}.${issued}`;
  return `${body}.${sign(body)}`;
}

function parseToken(token: string): { userId: string; issued: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, issued, sig] = parts;
  const body = `${userId}.${issued}`;
  const expected = sign(body);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const issuedNum = Number(issued);
  if (!Number.isFinite(issuedNum)) return null;
  const ageDays = (Date.now() - issuedNum) / 86_400_000;
  if (ageDays > SESSION_DAYS) return null;
  return { userId, issued: issuedNum };
}

type DbUserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
};

function rowToPublic(row: DbUserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at.toISOString()
  };
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Некорректный email" };
  }
  if (name.length < 1 || name.length > 60) {
    return { ok: false, error: "Имя должно быть от 1 до 60 символов" };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "Пароль должен быть не короче 8 символов" };
  }

  const id = crypto.randomUUID();
  const passwordHash = hashPassword(input.password);

  try {
    const res = await getPool().query<DbUserRow>(
      `INSERT INTO users (id, email, name, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, password_hash, created_at`,
      [id, email, name, passwordHash]
    );
    return { ok: true, user: rowToPublic(res.rows[0]) };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") {
      return { ok: false, error: "Этот email уже зарегистрирован" };
    }
    throw e;
  }
}

export async function authenticate(
  email: string,
  password: string
): Promise<PublicUser | null> {
  const normalized = email.trim().toLowerCase();
  const res = await getPool().query<DbUserRow>(
    `SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1`,
    [normalized]
  );
  const row = res.rows[0];
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return rowToPublic(row);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const res = await getPool().query<DbUserRow>(
    `SELECT id, email, name, password_hash, created_at FROM users WHERE id = $1`,
    [id]
  );
  const row = res.rows[0];
  return row ? rowToPublic(row) : null;
}

export function setSessionCookie(userId: string): void {
  cookies().set(COOKIE_NAME, makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
}

export function clearSessionCookie(): void {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = parseToken(token);
  if (!parsed) return null;
  return getUserById(parsed.userId);
}
