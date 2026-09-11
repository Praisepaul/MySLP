import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getTherapistProfileDraft, publishTherapistProfile, saveTherapistProfileDraft, type EditableTherapistProfile } from "@/lib/cms/site-settings-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json({ profile: await getTherapistProfileDraft() });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't load the profile." }, { status: unauthorized ? 401 : 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const profile = await request.json() as EditableTherapistProfile;
    if (!profile || typeof profile !== "object") return NextResponse.json({ error: "Invalid profile." }, { status: 400 });
    return NextResponse.json({ profile: await saveTherapistProfileDraft(profile) });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't save the profile draft." }, { status: unauthorized ? 401 : 400 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json().catch(() => ({})) as { action?: string };
    if (body.action !== "publish") return NextResponse.json({ error: "Unsupported profile action." }, { status: 400 });
    return NextResponse.json({ profile: await publishTherapistProfile() });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't publish the profile." }, { status: unauthorized ? 401 : 400 });
  }
}
