import { NextRequest, NextResponse } from "next/server";
import { getPresignedURL, deleteObject } from "@/lib/r2";
import { getCurrentUser } from "@/lib/auth";
import { updateUserProfileImage } from "../users/controller";
import { UserRole } from "@prisma/client";
import {
  getEventById,
  removeEventImage,
  updateEventImage,
} from "../events/controller";
import { checkAndIncrementStorage } from "@/lib/r2Storage";

const MAX_PROFILE_SIZE = 1 * 1024 * 1024;   // 1 MB
const MAX_EVENT_SIZE   = 10 * 1024 * 1024;  // 10 MB

const R2_PUBLIC_DOMAIN = "https://pub-d899e9b4014047699cafc4710a50477f.r2.dev";

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
    // FIX: Handle leading slashes to avoid double slash (e.g., .dev//events)
    const cleanFilename = filename.startsWith("/")
      ? filename.slice(1)
      : filename;

    // Construct the URL directly
    const url = `${R2_PUBLIC_DOMAIN}/${cleanFilename}`;

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
      const fileSizeBytes = Number(body.fileSizeBytes);
      if (!fileSizeBytes || fileSizeBytes > MAX_PROFILE_SIZE) {
        return NextResponse.json(
          { error: "File must be 1MB or less." },
          { status: 400 }
        );
      }

      const allowed = await checkAndIncrementStorage(fileSizeBytes);
      if (!allowed) {
        return NextResponse.json(
          { error: "Storage limit reached. No new uploads can be accepted." },
          { status: 507 }
        );
      }

      const key = `profiles/${user.id}`;

      // Delete old image if it was from signup (different key pattern)
      if (user.profileImage && user.profileImage !== key) {
        await deleteObject(user.profileImage).catch(() => {});
      }

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

      const fileSizeBytes = Number(body.fileSizeBytes);
      if (!fileSizeBytes || fileSizeBytes > MAX_EVENT_SIZE) {
        return NextResponse.json(
          { error: "File must be 10MB or less." },
          { status: 400 }
        );
      }

      const allowed = await checkAndIncrementStorage(fileSizeBytes);
      if (!allowed) {
        return NextResponse.json(
          { error: "Storage limit reached. No new uploads can be accepted." },
          { status: 507 }
        );
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

      if (!/^[\w\-./]+$/.test(body.imageKey)) {
        return NextResponse.json({ error: "Invalid image key" }, { status: 400 });
      }

      const event = await getEventById(body.eventId);

      if (!event || !event.images.includes(body.imageKey)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      await deleteObject(body.imageKey);

      await removeEventImage(body.eventId, body.imageKey);

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
