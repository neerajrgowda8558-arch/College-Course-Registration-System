
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";

// PUT: Update student details (Admin only)
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
      student_name,
      email,
      department,
      semester,
    } = body;

    if (
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
      `UPDATE students
       SET student_name = $1,
           email = $2,
           department = $3,
           semester = $4
       WHERE student_id = $5
       RETURNING *`,
      [student_name, email, department, semester, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      student: result.rows[0],
    });

  } catch (error) {
    console.error("Update student error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update student",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove student (Admin only)
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
      "DELETE FROM students WHERE student_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });

  } catch (error) {
    console.error("Delete student error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete student",
      },
      { status: 500 }
    );
  }
}
