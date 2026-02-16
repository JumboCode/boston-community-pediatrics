import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY!;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const ENDPOINT = process.env.R2_ENDPOINT!;
const BUCKET = process.env.R2_BUCKET!;
const PUBLIC_R2 = "https://pub-d899e9b4014047699cafc4710a50477f.r2.dev";

export const S3 = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function getPresignedURL(filename: string) {
  const url = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: filename,
    }),
    {
      expiresIn: 600,
    }
  );
  return url;
}

export function getPublicURL(filename: string) {
  const cleanFilename = filename.startsWith("/") ? filename.slice(1) : filename;

  return `${PUBLIC_R2}/${cleanFilename}`;
}

export async function deleteObject(filename: string) {
  await S3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: filename,
    })
  );
}

export default S3;
