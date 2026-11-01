
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";

// PUT: Update course details (Admin only)
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

    const { course_name, credits, department } = body;

    if (
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
      `UPDATE courses
       SET course_name = $1,
           credits = $2,
           department = $3
       WHERE course_id = $4
       RETURNING *`,
      [course_name, credits, department, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course: result.rows[0],
    });

  } catch (error) {
    console.error("Update course error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update course",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove course (Admin only)
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
      "DELETE FROM courses WHERE course_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });

  } catch (error) {
    console.error("Delete course error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete course",
      },
      { status: 500 }
    );
  }
}
