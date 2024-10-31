// Some code in this file was taken from two articles (modified to fit this project):
// https://ethanmick.com/how-to-upload-a-file-in-next-js-13-app-directory/
// and
// https://medium.com/@antoinewg/upload-a-file-to-s3-with-next-js-13-4-and-app-router-e04930601cd6

import { NextRequest, NextResponse } from "next/server";
import {
    S3Client,
    ListObjectsCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

const Bucket = process.env.AMPLIFY_BUCKET;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {

    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
        return NextResponse.json({ success: false }, { status: 500 });
    }

    const body = await file.arrayBuffer();
    const fileExt = file.name.match(/\.[a-zA-Z]*/gi)[0];
    const remoteFilePath = fileExt.concat("/", file.name);
    
    const response = s3.send(new PutObjectCommand({ Bucket: Bucket, Key: remoteFilePath, Body: body }));

    return NextResponse.json(response);
}

export async function GET() {
  //listing objects in the S3 bucket
  const response = await s3.send(new ListObjectsV2Command({ Bucket: Bucket, MaxKeys: 250 }));

  //checking if there are any files in the bucket
  if (!response.Contents || response.Contents.length === 0) {
    return NextResponse.json({ success: true, files: [] });
  }

  //map over the response to get file details
  const files = response.Contents.map((file) => {
    const fileType = file.Key.split('.').pop(); // Get file extension as type

    return {
      key: file.Key,
      type: fileType, // Using file extension as type
    };
  });
  

  return NextResponse.json({ success: true, files });
}
