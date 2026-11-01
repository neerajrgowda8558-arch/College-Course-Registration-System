
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

// PUT: Update enrollment (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      student_id,
      course_id,
      enrollment_date,
      status,
    } = body;

    const result = await pool.query(
      `UPDATE enrollments
       SET student_id = $1,
           course_id = $2,
           enrollment_date = $3,
           status = $4
       WHERE enrollment_id = $5
       RETURNING *`,
      [
        student_id,
        course_id,
        enrollment_date,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enrollment updated successfully",
      enrollment: result.rows[0],
    });

  } catch (error) {
    console.error("Update enrollment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update enrollment",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove enrollment (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;

    const result = await pool.query(
      "DELETE FROM enrollments WHERE enrollment_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enrollment deleted successfully",
      enrollment: result.rows[0],
    });

  } catch (error) {
    console.error("Delete enrollment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete enrollment",
      },
      { status: 500 }
    );
  }
}
