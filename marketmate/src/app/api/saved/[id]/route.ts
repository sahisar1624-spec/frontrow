import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const table = type === "health_check" ? "health_checks" : "generations";

  const result = db
    .prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`)
    .run(numericId, user.id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
