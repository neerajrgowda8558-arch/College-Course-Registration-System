
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type SessionUser = {
  userId: string;
  username: string;
  role: "admin" | "student";
  studentId: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    if (
      !payload.sub ||
      typeof payload.username !== "string" ||
      (payload.role !== "admin" && payload.role !== "student")
    ) {
      return null;
    }

    const studentId =
      typeof payload.studentId === "string"
        ? payload.studentId
        : null;

    if (payload.role === "student" && !studentId) {
      return null;
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      studentId,
    };
  } catch {
    return null;
  }
}
