
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { requireAdmin } from "../../../lib/requireAdmin";

// GET: Fetch all students (Admin only)
export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const result = await pool.query(
      "SELECT * FROM students ORDER BY student_id"
    );

    return NextResponse.json({
      success: true,
      students: result.rows,
    });
  } catch (error) {
    console.error("Students API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch students",
      },
      { status: 500 }
    );
  }
}

// POST: Add a new student (Admin only)
export async function POST(request: Request) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const {
      student_id,
      student_name,
      email,
      department,
      semester,
    } = body;

    // Validate required fields
    if (
      !student_id ||
      !student_name ||
      !email ||
      !department ||
      semester === undefined ||
      semester === null
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
      `INSERT INTO students
       (student_id, student_name, email, department, semester)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        student_id,
        student_name,
        email,
        department,
        semester,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Student added successfully",
      student: result.rows[0],
    });
  } catch (error) {
    console.error("Add student error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add student. Check for duplicate ID or invalid data.",
      },
      { status: 500 }
    );
  }
}
