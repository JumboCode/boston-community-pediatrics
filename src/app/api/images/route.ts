import { NextRequest, NextResponse } from "next/server";
import { getPublicURL, getPresignedURL, deleteObject } from "@/lib/r2";
import { getCurrentUser } from "@/lib/auth";
import { updateUserProfileImage } from "../users/controller";
import { UserRole } from "@prisma/client";
import {
  getEventById,
  removeEventImage,
  updateEventImage,
} from "../events/controller";
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
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.type === "profile") {
      const key = `profiles/${user.id}`;

      await updateUserProfileImage(user.id, key);

      const url = await getPresignedURL(key);
      return NextResponse.json({ key, url });
    }

    if (body.type === "event") {
      if (user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (!body.eventId) {
        return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
      }

      const event = await getEventById(body.eventId);

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      const key = `events/${body.eventId}/${crypto.randomUUID()}`;

      await updateEventImage(body.eventId, key);

      const url = await getPresignedURL(key);
      return NextResponse.json({ key, url });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Failed to handle POST /api/images:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.filename) {
      const url = new URL(body.filename);
      const pathParts = url.pathname.split("/");
      const key = decodeURIComponent(
        pathParts[pathParts.length - 1].split("?")[0]
      );

      await deleteObject(key);
      return NextResponse.json({ ok: true });
    }

    if (body.type === "profile") {
      if (!user.profileImage) {
        return NextResponse.json({ ok: true });
      }

      await deleteObject(user.profileImage);

      await updateUserProfileImage(user.id, null);

      return NextResponse.json({ ok: true });
    }

    if (body.type === "event") {
      if (user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (!body.eventId || !body.imageKey) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      const event = await getEventById(body.eventId);

      if (!event || !event.images.includes(body.imageKey)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      await deleteObject(body.imageKey);

      await removeEventImage(body.eventId, body.imageKey);

      return NextResponse.json({ ok: true });
    }

    if (body.key) {
      await deleteObject(body.key);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Failed to handle DELETE /api/images:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
