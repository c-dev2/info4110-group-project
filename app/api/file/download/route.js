import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const Bucket = process.env.AMPLIFY_BUCKET;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(req) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ success: false, message: "File key is required." }, { status: 400 });
  }

  try {
    const command = new GetObjectCommand({ Bucket, Key: key });
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour

    return NextResponse.json({ success: true, url: downloadUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Could not generate download URL." }, { status: 500 });
  }
}