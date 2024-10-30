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

    const response = s3.send(new PutObjectCommand({ Bucket: Bucket, Key: file.name, Body: body }));

    return NextResponse.json(response);
}