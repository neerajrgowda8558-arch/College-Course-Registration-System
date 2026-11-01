
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";

// PUT: Update marks (Admin only)
export async function PUT(
  request: Request,
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
      enrollment_id,
      internal_marks,
      external_marks,
      grade,
    } = body;

    if (
      !enrollment_id ||
      internal_marks === undefined ||
      external_marks === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 }
      );
    }

    const internal = Number(internal_marks);
    const external = Number(external_marks);

    if (
      !Number.isFinite(internal) ||
      !Number.isFinite(external) ||
      internal < 0 ||
      external < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Marks must be valid non-negative numbers",
        },
        { status: 400 }
      );
    }

    const total = internal + external;

    const result = await pool.query(
      `UPDATE marks
       SET enrollment_id = $1,
           internal_marks = $2,
           external_marks = $3,
           total_marks = $4,
           grade = $5
       WHERE mark_id = $6
       RETURNING *`,
      [
        enrollment_id,
        internal,
        external,
        total,
        grade || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Marks record not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Marks updated successfully",
      marks: result.rows[0],
    });

  } catch (error) {
    console.error("Update marks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update marks",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete marks (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;

    const result = await pool.query(
      "DELETE FROM marks WHERE mark_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Marks record not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Marks deleted successfully",
    });

  } catch (error) {
    console.error("Delete marks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete marks",
      },
      { status: 500 }
    );
  }
}
