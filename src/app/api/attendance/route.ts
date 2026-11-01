
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { requireAdmin } from "../../../lib/requireAdmin";

// GET: Fetch all attendance records (Admin only)
export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const result = await pool.query(`
      SELECT
        a.attendance_id,
        a.enrollment_id,
        e.student_id,
        s.student_name,
        e.course_id,
        c.course_name,
        a.attendance_date,
        a.status
      FROM attendance a
      JOIN enrollments e
        ON a.enrollment_id = e.enrollment_id
      JOIN students s
        ON e.student_id = s.student_id
      JOIN courses c
        ON e.course_id = c.course_id
      ORDER BY a.attendance_date DESC, a.attendance_id
    `);

    return NextResponse.json({
      success: true,
      attendance: result.rows,
    });
  } catch (error) {
    console.error("Attendance fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch attendance",
      },
      { status: 500 }
    );
  }
}

// POST: Add new attendance (Admin only)
export async function POST(request: Request) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    const {
      enrollment_id,
      attendance_date,
      status,
    } = body;

    if (!enrollment_id || !attendance_date || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (!["Present", "Absent", "Late"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid attendance status",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO attendance
       (enrollment_id, attendance_date, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        enrollment_id,
        attendance_date,
        status,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Attendance added successfully",
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("Add attendance error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add attendance. Check the enrollment ID and date.",
      },
      { status: 500 }
    );
  }
}
