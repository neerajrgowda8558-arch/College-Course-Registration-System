
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { requireAdmin } from "../../../lib/requireAdmin";

// GET: Fetch all marks (Admin only)
export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const result = await pool.query(`
      SELECT
        m.mark_id,
        m.enrollment_id,
        e.student_id,
        s.student_name,
        e.course_id,
        c.course_name,
        m.internal_marks,
        m.external_marks,
        m.total_marks,
        m.grade
      FROM marks m
      JOIN enrollments e
        ON m.enrollment_id = e.enrollment_id
      JOIN students s
        ON e.student_id = s.student_id
      JOIN courses c
        ON e.course_id = c.course_id
      ORDER BY m.mark_id
    `);

    return NextResponse.json({
      success: true,
      marks: result.rows,
    });
  } catch (error) {
    console.error("Marks fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch marks",
      },
      { status: 500 }
    );
  }
}

// POST: Add marks for an enrollment (Admin only)
export async function POST(request: Request) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const {
      enrollment_id,
      internal_marks,
      external_marks,
      grade,
    } = body;

    // Validate required fields
    if (
      !enrollment_id ||
      internal_marks === undefined ||
      external_marks === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enrollment ID and both marks are required",
        },
        { status: 400 }
      );
    }

    const internal = Number(internal_marks);
    const external = Number(external_marks);

    // Validate marks
    if (
      !Number.isFinite(internal) ||
      !Number.isFinite(external) ||
      internal < 0 ||
      external < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Marks must be valid non-negative numbers",
        },
        { status: 400 }
      );
    }

    const total = internal + external;

    const result = await pool.query(
      `INSERT INTO marks
       (enrollment_id, internal_marks, external_marks, total_marks, grade)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        enrollment_id,
        internal,
        external,
        total,
        grade || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Marks added successfully",
      marks: result.rows[0],
    });
  } catch (error) {
    console.error("Add marks error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add marks. Check the enrollment ID.",
      },
      { status: 500 }
    );
  }
}
