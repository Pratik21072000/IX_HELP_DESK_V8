import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  department?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function createToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id.toString(),
    username: user.username,
    role: user.role,
    department: user.department || undefined,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.userId) },
    });

    return user;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function isManager(role: string): boolean {
  return ["ADMIN", "FINANCE", "HR"].includes(role);
}

export function canManageDepartment(
  userRole: string,
  userDepartment: string | null,
  ticketDepartment: string,
): boolean {
  if (userRole === "EMPLOYEE") return false;
  return userDepartment === ticketDepartment;
}
