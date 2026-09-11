import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import { requireAdminSession } from "@/lib/admin/auth";
import { getMongoDb } from "@/lib/db/mongodb";
import { getTherapistProfileDraft, saveTherapistProfileDraft } from "@/lib/cms/site-settings-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bucketName = "profile_media";
const draftFileName = "therapist-profile-image-draft";
const maxBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function getBucket() { return new GridFSBucket(await getMongoDb(), { bucketName }); }
async function deleteFiles(filename: string) { const bucket = await getBucket(); const files = await bucket.find({ filename }).toArray(); await Promise.all(files.map((file) => bucket.delete(file._id))); }

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const formData = await request.formData(); const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG, WebP or GIF image." }, { status: 400 });
    if (file.size === 0 || file.size > maxBytes) return NextResponse.json({ error: "Please choose an image smaller than 5 MB." }, { status: 400 });
    const bucket = await getBucket(); await deleteFiles(draftFileName);
    const upload = bucket.openUploadStream(draftFileName, { metadata: { contentType: file.type, purpose: "therapist-profile-image-draft" } });
    await new Promise<void>((resolve, reject) => { upload.once("finish", () => resolve()); upload.once("error", reject); void file.arrayBuffer().then((buffer) => upload.end(Buffer.from(buffer))).catch(reject); });
    const profile = await getTherapistProfileDraft(); const saved = await saveTherapistProfileDraft({ ...profile, profileImage: "/api/profile/image?draft=1" });
    return NextResponse.json({ profile: saved, imageUrl: saved.profileImage });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't upload the profile image." }, { status: unauthorized ? 401 : 500 });
  }
}

export async function DELETE() {
  try {
    await requireAdminSession(); await deleteFiles(draftFileName);
    const profile = await getTherapistProfileDraft(); const saved = await saveTherapistProfileDraft({ ...profile, profileImage: "" });
    return NextResponse.json({ profile: saved });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Admin authentication is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't remove the profile image." }, { status: unauthorized ? 401 : 500 });
  }
}
