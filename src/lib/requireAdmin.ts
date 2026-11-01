
import { getSessionUser } from "./auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized. Please log in.",
      },
      { status: 401 }
    );
  }

  if (session.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Admin access required.",
      },
      { status: 403 }
    );
  }

  return null;
}
