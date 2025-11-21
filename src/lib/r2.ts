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

export const S3 = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function getPresignedURL(filename: string) {
  const url = getSignedUrl(
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
  const endpointURL = new URL(ENDPOINT);
  const host = endpointURL.host;

  return `https://${BUCKET}.${host}/${filename}`;
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
