
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

// GET: Fetch all enrollments (Admin only)
export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const result = await pool.query(`
      SELECT
        enrollment_id,
        student_id,
        course_id,
        enrollment_date,
        status
      FROM enrollments
      ORDER BY enrollment_id;
    `);

    return NextResponse.json({
      success: true,
      enrollments: result.rows,
    });
  } catch (error) {
    console.error("Fetch enrollments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch enrollments",
      },
      { status: 500 }
    );
  }
}

// POST: Add a new enrollment (Admin only)
export async function POST(request: Request) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const {
      student_id,
      course_id,
      enrollment_date,
      status,
    } = body;

    // Validate required fields
    if (!student_id || !course_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Student ID and Course ID are required",
        },
        { status: 400 }
      );
    }

    // Validate enrollment status
    const validStatuses = [
      "Enrolled",
      "Completed",
      "Dropped",
    ];

    const enrollmentStatus = status || "Enrolled";

    if (!validStatuses.includes(enrollmentStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid enrollment status",
        },
        { status: 400 }
      );
    }

    // Insert enrollment
    // enrollment_id is generated automatically by PostgreSQL
    const result = await pool.query(
      `INSERT INTO enrollments
        (student_id, course_id, enrollment_date, status)
       VALUES
        ($1, $2, COALESCE($3::date, CURRENT_DATE), $4)
       RETURNING *`,
      [
        student_id,
        course_id,
        enrollment_date || null,
        enrollmentStatus,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Enrollment added successfully",
        enrollment: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Add enrollment error:", error);

    const pgError = error as { code?: string };

    if (pgError.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This student is already enrolled in this course",
        },
        { status: 409 }
      );
    }

    if (pgError.code === "23503") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Student ID or Course ID",
        },
        { status: 400 }
      );
    }

    if (pgError.code === "23514") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid enrollment status",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add enrollment",
      },
      { status: 500 }
    );
  }
}
