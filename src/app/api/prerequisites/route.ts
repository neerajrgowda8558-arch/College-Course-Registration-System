
import { NextResponse } from "next/server";
import driver from "../../../lib/neo4j";
import { requireAdmin } from "../../../lib/requireAdmin";

// GET: Fetch course prerequisites (Admin only)
export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(`
      MATCH (c:Course)-[:HAS_PREREQUISITE]->(p:Course)
      RETURN
        c.course_id AS course_id,
        c.course_name AS course_name,
        p.course_id AS prerequisite_id,
        p.course_name AS prerequisite_name
      ORDER BY course_id, prerequisite_id
    `);

    const prerequisites = result.records.map((record) => ({
      course_id: record.get("course_id"),
      course_name: record.get("course_name"),
      prerequisite_id: record.get("prerequisite_id"),
      prerequisite_name: record.get("prerequisite_name"),
    }));

    return NextResponse.json({
      success: true,
      count: prerequisites.length,
      prerequisites,
    });
  } catch (error) {
    console.error("Neo4j prerequisites error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch prerequisites",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
