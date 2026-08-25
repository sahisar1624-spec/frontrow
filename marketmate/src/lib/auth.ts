import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import db, { type UserRow } from "./db";

const SESSION_COOKIE = "mm_session";
const SESSION_DAYS = 30;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fine for local MVP use, but callers should set a real JWT_SECRET in .env.local
    return "marketmate-dev-secret-change-me";
  }
  return secret;
}

export interface SessionPayload {
  userId: number;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: `${SESSION_DAYS}d` });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export interface CurrentUser {
  id: number;
  email: string;
}

/** Reads the session cookie (server components / route handlers) and returns the logged-in user, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = db
    .prepare("SELECT id, email FROM users WHERE id = ?")
    .get(payload.userId) as Pick<UserRow, "id" | "email"> | undefined;

  if (!user) return null;
  return { id: user.id, email: user.email };
}
