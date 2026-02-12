import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSignupConfirmed } from "@/lib/email/sendSignupConfirmed";
import { sendWaitlisted } from "@/lib/email/sendWaitlisted";

// --- Configuration ---
const MAX_GUESTS = 20;

// --- Interfaces ---
interface GuestInput {
  firstName: string;
  lastName: string;
  email?: string | null;
  phoneNumber?: string | null;
  relationship?: string | null;
  dateOfBirth?: string | null;
}

const tz = "America/New_York";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);

const fmtTime = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);

const formatLocation = (p: {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
}) => {
  const line2 = p.addressLine2 ? ` ${p.addressLine2}` : "";
  return `${p.addressLine1}${line2}, ${p.city}, ${p.state} ${p.zipCode}`;
};

// ==========================================
// POST: Create New Registration
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const { userId, positionId, guests } = await req.json();

    // 1. LIMIT CHECK
    if (guests && guests.length > MAX_GUESTS) {
      return NextResponse.json(
        {
          error: `Guest limit exceeded. Maximum ${MAX_GUESTS} guests allowed.`,
        },
        { status: 400 }
      );
    }

    const spotsNeeded = 1 + (guests?.length || 0);

    const result = await prisma.$transaction(async (tx) => {
      // 2. DUPLICATE CHECK
      const existingSignup = await tx.eventSignup.findFirst({
        where: { userId, positionId },
      });

      const existingWaitlist = await tx.eventWaitlist.findFirst({
        where: { userId, positionId },
      });

      if (existingSignup || existingWaitlist) {
        throw new Error("ALREADY_REGISTERED");
      }

      // 3. Fetch Position Details
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { firstName: true, emailAddress: true },
      });
      if (!user) throw new Error("User not found");

      const position = await tx.eventPosition.findUnique({
        where: { id: positionId },
        select: {
          position: true,
          date: true,
          startTime: true,
          endTime: true,
          filledSlots: true,
          totalSlots: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          zipCode: true,
          event: { select: { name: true } },
          eventId: true,
        },
      });
      if (!position) throw new Error("Position not found");

      const isFull = position.filledSlots + spotsNeeded > position.totalSlots;

      // 4. SCENARIO A: WAITLIST
      if (isFull) {
        const waitlistPosition =
          (await tx.eventWaitlist.count({ where: { positionId } })) + 1;

        const waitlistEntry = await tx.eventWaitlist.create({
          data: {
            userId,
            positionId,
            guests: {
              create: (guests ?? []).map((guest: GuestInput) => ({
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email || null,
                relation: guest.relationship || null,
              })),
            },
          },
          include: { guests: true },
        });

        return {
          status: "waitlisted",
          data: waitlistEntry,
          email: {
            kind: "waitlisted" as const,
            user,
            position,
            waitlistPosition,
          },
        };
      }

      // 5. SCENARIO B: SIGNUP (Success)
      const newSignup = await tx.eventSignup.create({
        data: {
          userId,
          positionId,
          eventId: position.eventId,
          hasGuests: (guests?.length ?? 0) > 0,
          guests: {
            create: (guests ?? []).map((guest: GuestInput) => ({
              positionId,
              firstName: guest.firstName,
              lastName: guest.lastName,
              emailAddress: guest.email || null,
              phoneNumber: guest.phoneNumber || null,
              relation: guest.relationship || null,
            })),
          },
        },
        include: { guests: true },
      });

      await tx.eventPosition.update({
        where: { id: positionId },
        data: { filledSlots: { increment: spotsNeeded } },
      });

      const filledSlotsAfter = position.filledSlots + spotsNeeded;

      return {
        status: "registered",
        data: newSignup,
        email: {
          kind: "registered" as const,
          user,
          position,
          filledSlotsAfter,
        },
      };
    });

    try {
      const email = (result as any).email;
      if (email) {
        // TODO: FIX TS ONCE WE GET DOMAIN SHI
        const to = "bcpjumbocode@gmail.com";
        // const to = email.user.emailAddress;

        if (email.kind === "registered") {
          await sendSignupConfirmed({
            to,
            firstName: email.user.firstName,
            eventName: email.position.event.name,
            position: email.position.position,
            date: fmtDate(email.position.date),
            startTime: fmtTime(email.position.startTime),
            endTime: fmtTime(email.position.endTime),
            filledSlots: email.filledSlotsAfter,
            location: formatLocation(email.position),
          });
        } else {
          await sendWaitlisted({
            to,
            firstName: email.user.firstName,
            eventName: email.position.event.name,
            position: email.position.position,
            date: fmtDate(email.position.date),
            startTime: fmtTime(email.position.startTime),
            endTime: fmtTime(email.position.endTime),
            filledSlots: email.position.filledSlots,
            location: formatLocation(email.position),
            waitlistPosition: email.waitlistPosition,
          });
        }
      }
    } catch (e) {
      console.error("Email failed (continuing anyway):", e);
    }
    // This is just so we don't leak email to client
    const { email, ...safe } = result as any;
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    console.error("Failed to process registration:", error);

    if (error instanceof Error && error.message === "ALREADY_REGISTERED") {
      return NextResponse.json(
        {
          error: "You are already registered or waitlisted for this position.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT: Update Existing Registration
// ==========================================
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Missing registration ID" },
        { status: 400 }
      );

    const { guests } = await req.json();

    // 1. LIMIT CHECK
    if (guests && guests.length > MAX_GUESTS) {
      return NextResponse.json(
        {
          error: `Guest limit exceeded. Maximum ${MAX_GUESTS} guests allowed.`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // -------------------------------------------------------
      // PATH A: User is currently in SIGNUP (Main List)
      // -------------------------------------------------------
      const currentSignup = await tx.eventSignup.findUnique({
        where: { id },
        include: { guests: true },
      });

      if (currentSignup) {
        const position = await tx.eventPosition.findUnique({
          where: { id: currentSignup.positionId },
        });

        if (!position) throw new Error("Position data missing");

        const oldSpotsUsed = 1 + currentSignup.guests.length;
        const newSpotsNeeded = 1 + (guests?.length || 0);

        const usageWithoutUser = position.filledSlots - oldSpotsUsed;
        const willFit =
          usageWithoutUser + newSpotsNeeded <= position.totalSlots;

        // SCENARIO 1: Still fits -> Update normally
        if (willFit) {
          await tx.guest.deleteMany({ where: { signupId: id } });

          const updatedSignup = await tx.eventSignup.update({
            where: { id },
            data: {
              hasGuests: (guests?.length ?? 0) > 0,
              guests: {
                create: (guests ?? []).map((guest: GuestInput) => ({
                  positionId: currentSignup.positionId,
                  firstName: guest.firstName,
                  lastName: guest.lastName,
                  emailAddress: guest.email || null,
                  phoneNumber: guest.phoneNumber || null,
                  relation: guest.relationship || null,
                })),
              },
            },
            include: { guests: true },
          });

          // Adjust slots
          const spotDifference = newSpotsNeeded - oldSpotsUsed;
          if (spotDifference !== 0) {
            await tx.eventPosition.update({
              where: { id: currentSignup.positionId },
              data: { filledSlots: { increment: spotDifference } },
            });
          }

          return { status: "registered", data: updatedSignup };
        }

        // SCENARIO 2: Does NOT fit -> Move to Waitlist
        else {
          await tx.guest.deleteMany({ where: { signupId: id } }); // Delete guests first
          await tx.eventSignup.delete({ where: { id } }); // Delete signup

          await tx.eventPosition.update({
            where: { id: currentSignup.positionId },
            data: { filledSlots: { decrement: oldSpotsUsed } },
          });

          const newWaitlistEntry = await tx.eventWaitlist.create({
            data: {
              userId: currentSignup.userId,
              positionId: currentSignup.positionId,
              guests: {
                create: (guests ?? []).map((guest: GuestInput) => ({
                  firstName: guest.firstName,
                  lastName: guest.lastName,
                  email: guest.email || null,
                  relation: guest.relationship || null,
                })),
              },
            },
            include: { guests: true },
          });

          return {
            status: "moved_to_waitlist",
            message: "Capacity exceeded. You have been moved to the waitlist.",
            data: newWaitlistEntry,
          };
        }
      }

      // -------------------------------------------------------
      // PATH B: User is currently in WAITLIST
      // -------------------------------------------------------
      const currentWaitlist = await tx.eventWaitlist.findUnique({
        where: { id },
        include: { guests: true },
      });

      if (currentWaitlist) {
        const position = await tx.eventPosition.findUnique({
          where: { id: currentWaitlist.positionId },
        });

        if (!position) throw new Error("Position data missing");

        const newSpotsNeeded = 1 + (guests?.length || 0);

        // Check if they fit now (Waitlist users take up 0 slots, so we just check filled + needed)
        const willFit =
          position.filledSlots + newSpotsNeeded <= position.totalSlots;

        // SCENARIO 3: Now they FIT -> Move to Signup
        if (willFit) {
          // 1. Delete Waitlist Entry
          await tx.waitlistGuest.deleteMany({ where: { waitlistId: id } });
          await tx.eventWaitlist.delete({ where: { id } });

          // 2. Create Signup Entry
          const newSignup = await tx.eventSignup.create({
            data: {
              userId: currentWaitlist.userId,
              positionId: currentWaitlist.positionId,
              eventId: position.eventId,
              hasGuests: (guests?.length ?? 0) > 0,
              guests: {
                create: (guests ?? []).map((guest: GuestInput) => ({
                  positionId: currentWaitlist.positionId,
                  firstName: guest.firstName,
                  lastName: guest.lastName,
                  emailAddress: guest.email || null,
                  phoneNumber: guest.phoneNumber || null,
                  relation: guest.relationship || null,
                })),
              },
            },
            include: { guests: true },
          });

          // 3. Occupy the slots
          await tx.eventPosition.update({
            where: { id: currentWaitlist.positionId },
            data: { filledSlots: { increment: newSpotsNeeded } },
          });

          return {
            status: "registered",
            message: "Space available! You have been moved to the main list.",
            data: newSignup,
          };
        }

        // SCENARIO 4: Still doesn't fit -> Stay in Waitlist
        else {
          await tx.waitlistGuest.deleteMany({ where: { waitlistId: id } });

          const updatedWaitlist = await tx.eventWaitlist.update({
            where: { id },
            data: {
              guests: {
                create: (guests ?? []).map((guest: GuestInput) => ({
                  firstName: guest.firstName,
                  lastName: guest.lastName,
                  email: guest.email || null,
                  relation: guest.relationship || null,
                })),
              },
            },
            include: { guests: true },
          });

          return { status: "waitlisted", data: updatedWaitlist };
        }
      }

      throw new Error("Registration ID not found in Signup or Waitlist");
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Failed to update registration:", error);
    const status =
      error instanceof Error && error.message.includes("not found") ? 404 : 500;
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status }
    );
  }
}
