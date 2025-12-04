import { NextRequest, NextResponse } from "next/server";
import { getPublicURL, getPresignedURL, deleteObject } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Missing filename query parameter" },
      { status: 400 }
    );
  }

  try {
    const url = getPublicURL(filename);
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to get public URL" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { filename }: { filename: string } = await req.json();

  if (!filename) {
    return NextResponse.json(
      { error: "Missing filename in body" },
      { status: 400 }
    );
  }

  try {
    const url = await getPresignedURL(filename);
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { filename }: { filename: string } = await req.json();
  if (!filename) {
    return NextResponse.json(
      { error: "Missing filename in body" },
      { status: 400 }
    );
  }

  try {
    await deleteObject(filename);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete object" },
      { status: 500 }
    );
  }
}
