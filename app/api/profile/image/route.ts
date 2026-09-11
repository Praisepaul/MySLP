import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import { getMongoDb } from "@/lib/db/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bucketName = "profile_media";
const fileName = "therapist-profile-image";

export async function GET() {
  const bucket = new GridFSBucket(await getMongoDb(), { bucketName });
  const files = await bucket.find({ filename: fileName }).sort({ uploadDate: -1 }).limit(1).toArray();
  const file = files[0];
  if (!file) return new NextResponse(null, { status: 404 });

  const stream = bucket.openDownloadStream(file._id);
  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      stream.once("end", () => controller.close());
      stream.once("error", (error) => controller.error(error));
    },
    cancel() {
      stream.destroy();
    },
  });

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": file.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
