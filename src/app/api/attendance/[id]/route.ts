
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";

// PUT: Update attendance (Admin only)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const { enrollment_id, attendance_date, status } = body;

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
      `UPDATE attendance
       SET enrollment_id = $1,
           attendance_date = $2,
           status = $3
       WHERE attendance_id = $4
       RETURNING *`,
      [enrollment_id, attendance_date, status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update attendance",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete attendance (Admin only)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const { id } = await context.params;

    const result = await pool.query(
      `DELETE FROM attendance
       WHERE attendance_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete attendance",
      },
      { status: 500 }
    );
  }
}
