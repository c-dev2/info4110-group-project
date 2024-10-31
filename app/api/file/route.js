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

// Get S3 details from local .env file, including bucket name, region, and the access key and secret.
const Bucket = process.env.AMPLIFY_BUCKET;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// POST requests to this endpoint will upload a file to S3.
export async function POST(req) {

  // Get form data from body of request, then extract just the file.
    const data = await req.formData();
    const file = data.get("file");

    // If there's no file, return an error.
    if (!file) {
        return NextResponse.json({ success: false }, { status: 500 });
    }

    // Get file contents
    const body = await file.arrayBuffer();

    // Get file extension using regex, then concatentate this file extension to the file name
    // with a "/" between them to create a file path.
    // For example, "upload.txt" would become ".txt/upload.txt" after these two lines.
    const fileExt = file.name.match(/\.[a-zA-Z]*$/gi)[0]; // Matches any characters after a period at the end of the string.
    const remoteFilePath = fileExt.concat("/", file.name);
    
    // Send command to upload file to bucket. Key is the file path which was created above.
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
