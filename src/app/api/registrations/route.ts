import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// ==========================================
// POST: Create New Registration
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const { userId, positionId, guests } = await req.json();

    // 1. LIMIT CHECK
    if (guests && guests.length > MAX_GUESTS) {
      return NextResponse.json(
        { error: `Guest limit exceeded. Maximum ${MAX_GUESTS} guests allowed.` },
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

      // 4. SCENARIO A: WAITLIST
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

      // 5. SCENARIO B: SIGNUP (Success)
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

    if (error instanceof Error && error.message === "ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "You are already registered or waitlisted for this position." },
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

    if (!id) return NextResponse.json({ error: "Missing registration ID" }, { status: 400 });

    const { guests } = await req.json();

    // 1. LIMIT CHECK
    if (guests && guests.length > MAX_GUESTS) {
      return NextResponse.json(
        { error: `Guest limit exceeded. Maximum ${MAX_GUESTS} guests allowed.` },
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

        const oldSpotsUsed = 1 + currentSignup.guests.length; // User + old guests
        const newSpotsNeeded = 1 + (guests?.length || 0);     // User + new guests
        
        // Calculate the base usage of the event WITHOUT this user
        const usageWithoutUser = position.filledSlots - oldSpotsUsed;
        
        // Check if adding the NEW guest count fits
        const willFit = (usageWithoutUser + newSpotsNeeded) <= position.totalSlots;

        // SCENARIO 1: IT FITS -> Update normally
        if (willFit) {
          // Wipe old guests
          await tx.guest.deleteMany({ where: { signupId: id } });

          // Update signup with new guests
          const updatedSignup = await tx.eventSignup.update({
            where: { id },
            data: {
              hasGuests: (guests && guests.length > 0),
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

          // Adjust filled slots based on difference
          const spotDifference = newSpotsNeeded - oldSpotsUsed;
          if (spotDifference !== 0) {
            await tx.eventPosition.update({
              where: { id: currentSignup.positionId },
              data: { filledSlots: { increment: spotDifference } },
            });
          }

          return { status: "registered", data: updatedSignup };
        } 
        
        // SCENARIO 2: DOES NOT FIT -> Move to Waitlist
        else {
          // 1. Delete the Signup (and cascade delete guests)
          await tx.eventSignup.delete({ where: { id } });

          // 2. Free up the slots they were holding
          await tx.eventPosition.update({
            where: { id: currentSignup.positionId },
            data: { filledSlots: { decrement: oldSpotsUsed } },
          });

          // 3. Create new Waitlist entry
          const newWaitlistEntry = await tx.eventWaitlist.create({
            data: {
              userId: currentSignup.userId,
              positionId: currentSignup.positionId,
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

          return { 
            status: "moved_to_waitlist", 
            message: "Capacity exceeded. Your update has moved you to the waitlist.",
            data: newWaitlistEntry 
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
        // Since they are already on the waitlist, we don't care about capacity.
        // Just update their guest list.
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