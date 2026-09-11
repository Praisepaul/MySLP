import { NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await logoutAdmin();
  return NextResponse.redirect(new URL("/admin-login", request.url), 303);
}
