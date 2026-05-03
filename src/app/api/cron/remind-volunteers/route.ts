import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminder } from "@/lib/email/sendReminder";
import { getPublicURL } from "@/lib/r2";
import crypto from "crypto";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatLocation(pos: {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
}) {
  return [pos.addressLine1, pos.addressLine2, `${pos.city} ${pos.state} ${pos.zipCode}`]
    .filter(Boolean)
    .join(", ");
}

export async function POST(request: Request) {
  // Timing-safe secret comparison
  const authHeader = request.headers.get("Authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  const provided = authHeader ?? "";
  const encoder = new TextEncoder();
  const [a, b] = [encoder.encode(expected), encoder.encode(provided)];
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", a),
    crypto.subtle.digest("SHA-256", b),
  ]);
  const match =
    a.length === b.length &&
    Buffer.from(hashA).toString("hex") === Buffer.from(hashB).toString("hex");

  if (!match) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Find all signups for positions starting in ~24 hours
  const signups = await prisma.eventSignup.findMany({
    where: {
      userId: { not: null },
      position: {
        startTime: { gte: in23h, lte: in25h },
      },
    },
    include: {
      user: {
        select: { firstName: true, emailAddress: true },
      },
      position: {
        select: {
          position: true,
          startTime: true,
          endTime: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          zipCode: true,
          event: {
            select: { name: true, images: true },
          },
        },
      },
    },
  });

  const results: { signupId: string; status: string }[] = [];

  for (const signup of signups) {
    try {
      if (!signup.user?.emailAddress) continue;

      const rawImage = signup.position.event.images?.[0];
      const eventImage = rawImage
        ? rawImage.startsWith("http")
          ? rawImage
          : getPublicURL(rawImage)
        : undefined;

      await sendReminder({
        to: signup.user.emailAddress,
        firstName: signup.user.firstName,
        eventName: signup.position.event.name,
        position: signup.position.position,
        date: fmtDate(signup.position.startTime),
        startTime: fmtTime(signup.position.startTime),
        endTime: fmtTime(signup.position.endTime),
        location: formatLocation(signup.position),
        eventImage,
      });

      results.push({ signupId: signup.id, status: "sent" });
    } catch (err) {
      console.error(`Failed to send reminder for signup ${signup.id}:`, err);
      results.push({ signupId: signup.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
