import { NextResponse } from "next/server";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { bumpPublicAvailabilityRevision } from "@/lib/appointments/appointment-repository";
import { deleteService, getServices, setServiceActive, upsertService } from "@/lib/cms/services-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorizedResponse(error: unknown) { return error instanceof Error && error.message === "Google Calendar setup access is required."; }

export async function GET() { try { await requireGoogleCalendarSetupAccess(); return NextResponse.json({ services: await getServices() }); } catch (error) { const unauthorized = unauthorizedResponse(error); return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't load services." }, { status: unauthorized ? 401 : 500 }); } }
export async function POST(request: Request) { try { await requireGoogleCalendarSetupAccess(); const services = await upsertService(await request.json()); await bumpPublicAvailabilityRevision(); return NextResponse.json({ services }); } catch (error) { const unauthorized = unauthorizedResponse(error); return NextResponse.json({ error: unauthorized ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't save the service." }, { status: unauthorized ? 401 : 400 }); } }
export async function PATCH(request: Request) { try { await requireGoogleCalendarSetupAccess(); const body = await request.json(); if (!body || typeof body.id !== "string" || typeof body.active !== "boolean") return NextResponse.json({ error: "Invalid service." }, { status: 400 }); const services = await setServiceActive(body.id, body.active); await bumpPublicAvailabilityRevision(); return NextResponse.json({ services }); } catch (error) { const unauthorized = unauthorizedResponse(error); return NextResponse.json({ error: unauthorized ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't update the service." }, { status: unauthorized ? 401 : 400 }); } }
export async function DELETE(request: Request) { try { await requireGoogleCalendarSetupAccess(); const body = await request.json(); if (!body || typeof body.id !== "string") return NextResponse.json({ error: "Invalid service." }, { status: 400 }); const services = await deleteService(body.id); await bumpPublicAvailabilityRevision(); return NextResponse.json({ services }); } catch (error) { const unauthorized = unauthorizedResponse(error); return NextResponse.json({ error: unauthorized ? "Admin access is required." : error instanceof Error ? error.message : "We couldn't delete the service." }, { status: unauthorized ? 401 : 400 }); } }
