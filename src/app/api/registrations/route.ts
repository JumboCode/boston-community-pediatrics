import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- Interfaces ---
interface GuestInput {
  firstName: string;
  lastName: string;
  email?: string | null;
  phoneNumber?: string | null;
  relationship?: string | null;
  dateOfBirth?: string | null;
}

// ==========================================
// POST: Create New Registration
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const { userId, positionId, guests } = await req.json();

    const spotsNeeded = 1 + (guests?.length || 0);

    const result = await prisma.$transaction(async (tx) => {
      
      // ---------------------------------------------------------
      // 1. DUPLICATE CHECK (New Logic)
      // ---------------------------------------------------------
      // Check if user is already in the main signup list
      const existingSignup = await tx.eventSignup.findFirst({
        where: { 
          userId, 
          positionId 
        },
      });

      // Check if user is already in the waitlist
      const existingWaitlist = await tx.eventWaitlist.findFirst({
        where: { 
          userId, 
          positionId 
        },
      });

      if (existingSignup || existingWaitlist) {
        throw new Error("ALREADY_REGISTERED");
      }

      // ---------------------------------------------------------
      // 2. Fetch Position Details
      // ---------------------------------------------------------
      const position = await tx.eventPosition.findUnique({
        where: { id: positionId },
        select: { 
          eventId: true,
          filledSlots: true,
          totalSlots: true
        } 
      });

      if (!position) {
        throw new Error("Position not found");
      }

      const isFull = (position.filledSlots + spotsNeeded) > position.totalSlots;

      // ---------------------------------------------------------
      // 3. SCENARIO A: WAITLIST
      // ---------------------------------------------------------
      if (isFull) {
        const waitlistEntry = await tx.eventWaitlist.create({
          data: {
            userId,
            positionId,
            guests: {
              create: guests.map((guest: GuestInput) => ({
                firstName: guest.firstName, 
                lastName: guest.lastName,
                email: guest.email || null, 
                relation: guest.relationship || null,
              })),
            },
          },
          include: { guests: true }
        });

        return { status: "waitlisted", data: waitlistEntry };
      }

      // ---------------------------------------------------------
      // 4. SCENARIO B: SIGNUP (Success)
      // ---------------------------------------------------------
      const newSignup = await tx.eventSignup.create({
        data: {
          userId,
          positionId,
          eventId: position.eventId,
          hasGuests: (guests && guests.length > 0),
          guests: {
            create: guests.map((guest: GuestInput) => ({
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

      return { status: "registered", data: newSignup };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Failed to process registration:", error);

    // Return a readable error if it's the duplicate check
    if (error instanceof Error && error.message === "ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "You are already registered or waitlisted for this position." },
        { status: 409 } // 409 Conflict
      );
    }

    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}

// ... (PUT handler remains the same as previous step)

// ==========================================
// PUT: Update Existing Registration
// ==========================================
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing registration ID" }, { status: 400 });

    const { guests } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Try finding in Signups
      const currentSignup = await tx.eventSignup.findUnique({
        where: { id },
        include: { guests: true },
      });

      if (currentSignup) {
        const oldGuestCount = currentSignup.guests.length;
        const newGuestCount = guests?.length || 0;
        const spotDifference = newGuestCount - oldGuestCount;

        // Wipe old guests
        await tx.guest.deleteMany({ where: { signupId: id } });

        // Re-create guests (Using new firstName/lastName logic)
        const updatedSignup = await tx.eventSignup.update({
          where: { id },
          data: {
            guests: {
              create: guests.map((guest: GuestInput) => ({
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

        if (spotDifference !== 0) {
          await tx.eventPosition.update({
            where: { id: currentSignup.positionId },
            data: { filledSlots: { increment: spotDifference } },
          });
        }

        return { status: "registered", data: updatedSignup };
      }

      // 2. Try finding in Waitlist
      const currentWaitlist = await tx.eventWaitlist.findUnique({
        where: { id },
        include: { guests: true },
      });

      if (currentWaitlist) {
        await tx.waitlistGuest.deleteMany({ where: { waitlistId: id } });

        const updatedWaitlist = await tx.eventWaitlist.update({
          where: { id },
          data: {
            guests: {
              create: guests.map((guest: GuestInput) => ({
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

      throw new Error("Registration ID not found in Signup or Waitlist");
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Failed to update registration:", error);
    const status = error instanceof Error && error.message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: "Failed to update registration" }, { status });
  }
}