import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { checkAndIncrementStorage } from "@/lib/r2Storage";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

function joinPublicUrl(base: string, key: string) {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return `${cleanBase}/${cleanKey}`;
}

export async function POST(req: NextRequest) {
  try {
    const { fileType, fileSizeBytes } = await req.json();

    if (fileType !== "image/jpeg") {
      return NextResponse.json(
        { error: "Unsupported file type. Only JPEG images are allowed." },
        { status: 400 }
      );
    }

    if (typeof fileSizeBytes !== "number" || fileSizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be 1MB or less." },
        { status: 400 }
      );
    }

    const allowed = await checkAndIncrementStorage(fileSizeBytes);
    if (!allowed) {
      return NextResponse.json(
        { error: "Storage limit reached. No new uploads can be accepted." },
        { status: 507 }
      );
    }

    const key = `profilePictures/signup-${crypto.randomUUID()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: "image/jpeg",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    return NextResponse.json({
      uploadUrl,
      publicUrl: joinPublicUrl(R2_PUBLIC_DOMAIN, key),
    });
  } catch (error) {
    console.error("Error generating signup upload URL:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}