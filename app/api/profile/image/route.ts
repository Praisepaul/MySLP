import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import { requireAdminSession } from "@/lib/admin/auth";
import { getMongoDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bucketName = "profile_media";
const publishedFileName = "therapist-profile-image";
const draftFileName = "therapist-profile-image-draft";

export async function GET(request: Request) {
  const isDraft = new URL(request.url).searchParams.get("draft") === "1";
  if (isDraft) {
    try { await requireAdminSession(); } catch { return new NextResponse(null, { status: 401 }); }
  }
  const bucket = new GridFSBucket(await getMongoDb(), { bucketName });
  const fileName = isDraft ? draftFileName : publishedFileName;
  const files = await bucket.find({ filename: fileName }).sort({ uploadDate: -1 }).limit(1).toArray();
  const file = files[0];
  if (!file) return new NextResponse(null, { status: 404 });
  const stream = bucket.openDownloadStream(file._id);
  const webStream = new ReadableStream<Uint8Array>({
    start(controller) { stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk))); stream.once("end", () => controller.close()); stream.once("error", (error) => controller.error(error)); },
    cancel() { stream.destroy(); },
  });
  const contentType = typeof file.metadata?.contentType === "string" ? file.metadata.contentType : "application/octet-stream";
  return new NextResponse(webStream, { headers: { "Content-Type": contentType, "Cache-Control": isDraft ? "private, no-store" : "public, max-age=3600, stale-while-revalidate=86400", "X-Content-Type-Options": "nosniff" } });
}
