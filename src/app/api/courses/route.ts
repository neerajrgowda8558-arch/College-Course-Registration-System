
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { requireAdmin } from "../../../lib/requireAdmin";

// GET: Fetch all courses (Admin only)
export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const result = await pool.query(
      "SELECT * FROM courses ORDER BY course_id"
    );

    return NextResponse.json({
      success: true,
      courses: result.rows,
    });
  } catch (error) {
    console.error("Courses API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}

// POST: Add a new course (Admin only)
export async function POST(request: Request) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const {
      course_id,
      course_name,
      credits,
      department,
    } = body;

    if (
      !course_id ||
      !course_name ||
      credits === undefined ||
      credits === null ||
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
      `INSERT INTO courses
       (course_id, course_name, credits, department)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        course_id,
        course_name,
        credits,
        department,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Course added successfully",
      course: result.rows[0],
    });

  } catch (error) {
    console.error("Add course error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add course. Check for duplicate ID or invalid data.",
      },
      { status: 500 }
    );
  }
}
