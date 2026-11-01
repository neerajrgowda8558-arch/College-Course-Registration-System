
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";

// PUT: Update faculty details (Admin only)
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

    const {
      faculty_name,
      email,
      department,
    } = body;

    if (!faculty_name || !email || !department) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE faculty
       SET faculty_name = $1,
           email = $2,
           department = $3
       WHERE faculty_id = $4
       RETURNING *`,
      [faculty_name, email, department, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Faculty updated successfully",
      faculty: result.rows[0],
    });

  } catch (error) {
    console.error("Update faculty error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update faculty",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove faculty member (Admin only)
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
      "DELETE FROM faculty WHERE faculty_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Faculty deleted successfully",
    });

  } catch (error) {
    console.error("Delete faculty error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete faculty",
      },
      { status: 500 }
    );
  }
}
