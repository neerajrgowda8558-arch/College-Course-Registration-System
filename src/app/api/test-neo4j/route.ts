
import { NextResponse } from "next/server";
import driver from "../../../lib/neo4j";
import { requireAdmin } from "../../../lib/requireAdmin";

export async function GET() {
  const authError = await requireAdmin();

  if (authError) {
    return authError;
  }

  const session = driver.session({ database: "neo4j" });

  try {
    const result = await session.run(
      "MATCH (n) RETURN count(n) AS totalNodes"
    );

    const totalNodes = result.records[0]
      .get("totalNodes")
      .toNumber();

    return NextResponse.json({
      success: true,
      message: "Neo4j connected successfully",
      totalNodes,
    });
  } catch (error) {
    console.error("Neo4j connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Neo4j",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
