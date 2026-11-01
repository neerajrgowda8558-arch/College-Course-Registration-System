
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { requireAdmin } from "../../../lib/requireAdmin";

// GET: Fetch all faculty members (Admin only)
export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const result = await pool.query(
      `SELECT faculty_id, faculty_name, email, department
       FROM faculty
       ORDER BY faculty_id`
    );

    return NextResponse.json({
      success: true,
      faculty: result.rows,
    });

  } catch (error) {
    console.error("Fetch faculty error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch faculty",
      },
      { status: 500 }
    );
  }
}

// POST: Add a new faculty member (Admin only)
export async function POST(request: Request) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const {
      faculty_id,
      faculty_name,
      email,
      department,
    } = body;

    if (
      !faculty_id ||
      !faculty_name ||
      !email ||
      !department
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO faculty
       (faculty_id, faculty_name, email, department)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        faculty_id,
        faculty_name,
        email,
        department,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Faculty added successfully",
      faculty: result.rows[0],
    });

  } catch (error) {
    console.error("Add faculty error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add faculty. Check for duplicate ID or invalid data.",
      },
      { status: 500 }
    );
  }
}
