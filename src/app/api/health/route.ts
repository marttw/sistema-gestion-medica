import { connection } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  // Opt out of build-time prerendering: the check must run on every request.
  await connection();

  try {
    await db.$queryRaw`SELECT 1`;

    return Response.json({ status: "ok", database: "up" });
  } catch (error) {
    // Log details on the server only; never expose them to the client.
    console.error("[health] Database check failed:", error);

    return Response.json(
      { status: "error", database: "down" },
      { status: 503 },
    );
  }
}
