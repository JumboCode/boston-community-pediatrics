import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

// Using your specific ENV keys
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Hardcoded for now based on your previous snippet, but better to move to ENV
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;

const ALLOWED_FILE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function joinPublicUrl(base: string, key: string) {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return `${cleanBase}/${cleanKey}`;
}

export async function POST(req: NextRequest) {
  try {
    const { fileType } = await req.json();

    if (typeof fileType !== "string" || !(fileType in ALLOWED_FILE_TYPES)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Allowed: " +
            Object.keys(ALLOWED_FILE_TYPES).join(", "),
        },
        { status: 400 }
      );
    }

    const extension = ALLOWED_FILE_TYPES[fileType];
    const uniqueId = crypto.randomUUID();
    const key = `profilePictures/signup-${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    // Generate a temporary upload URL (valid for 600 seconds)
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