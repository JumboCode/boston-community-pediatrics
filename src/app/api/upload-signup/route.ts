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
const R2_PUBLIC_DOMAIN = "https://pub-d899e9b4014047699cafc4710a50477f.r2.dev";

export async function POST(req: NextRequest) {
  try {
    const { fileType } = await req.json();
    
    // Generate a unique filename for the new user
    const uniqueId = crypto.randomUUID();
    const extension = fileType.split("/")[1];
    const key = `profiles/signup-${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    // Generate a temporary upload URL (valid for 600 seconds)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
    console.log(uploadUrl);

    return NextResponse.json({
      uploadUrl,
      publicUrl: `${R2_PUBLIC_DOMAIN}/${key}`,
    });
  } catch (error) {
    console.error("Error generating signup upload URL:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}