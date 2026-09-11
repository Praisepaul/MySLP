import { NextResponse } from "next/server";
import { GridFSBucket, type GridFSFile } from "mongodb";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { getMongoDb } from "@/lib/db/mongodb";
import { getTherapistProfile, saveTherapistProfile } from "@/lib/cms/site-settings-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bucketName = "profile_media";
const fileName = "therapist-profile-image";
const maxBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function getBucket() {
  return new GridFSBucket(await getMongoDb(), { bucketName });
}

async function deleteCurrentImage() {
  const bucket = await getBucket();
  const files = await bucket.find({ filename: fileName }).toArray();
  await Promise.all(files.map((file) => bucket.delete(file._id)));
}

export async function POST(request: Request) {
  try {
    await requireGoogleCalendarSetupAccess();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG, WebP or GIF image." }, { status: 400 });
    if (file.size === 0 || file.size > maxBytes) return NextResponse.json({ error: "Please choose an image smaller than 5 MB." }, { status: 400 });

    const bucket = await getBucket();
    await deleteCurrentImage();
    const upload = bucket.openUploadStream(fileName, { contentType: file.type, metadata: { purpose: "therapist-profile-image" } });
    const buffer = Buffer.from(await file.arrayBuffer());
    await new Promise<void>((resolve, reject) => {
      upload.once("finish", () => resolve());
      upload.once("error", reject);
      upload.end(buffer);
    });

    const profile = await getTherapistProfile();
    const saved = await saveTherapistProfile({ ...profile, profileImage: "/api/profile/image" });
    return NextResponse.json({ profile: saved, imageUrl: saved.profileImage });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Google Calendar setup access is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't upload the profile image." }, { status: unauthorized ? 401 : 500 });
  }
}

export async function DELETE() {
  try {
    await requireGoogleCalendarSetupAccess();
    await deleteCurrentImage();
    const profile = await getTherapistProfile();
    const saved = await saveTherapistProfile({ ...profile, profileImage: "" });
    return NextResponse.json({ profile: saved });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Google Calendar setup access is required.";
    return NextResponse.json({ error: unauthorized ? "Admin access is required." : "We couldn't remove the profile image." }, { status: unauthorized ? 401 : 500 });
  }
}

void (undefined as unknown as GridFSFile);
