import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GuestInput {
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  relationship?: string | null;
  // Add other frontend fields if necessary, e.g., dateOfBirth, comments
}

export async function POST(req: NextRequest) {
  try {
    const { userId, positionId, guests } = await req.json();

    // 1. Calculate total spots needed (Main User + Guests)
    const spotsNeeded = 1 + (guests?.length || 0);

    const result = await prisma.$transaction(async (tx) => {
      
      // 2. Fetch Position to check capacity & get eventId
      // We must do this INSIDE the transaction to prevent race conditions
      // (e.g. two people signing up for the last spot at the exact same time)
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

      // 3. CHECK CAPACITY
      const isFull = (position.filledSlots + spotsNeeded) > position.totalSlots;

      // --- SCENARIO A: WAITLIST ---
      if (isFull) {
        const waitlistEntry = await tx.eventWaitlist.create({
          data: {
            userId,
            positionId,
            // Create Waitlist Guests
            guests: {
              create: guests.map((guest: GuestInput) => {
                const nameParts = guest.fullName.trim().split(" ");
                return {
                  firstName: nameParts[0],
                  lastName: nameParts.slice(1).join(" ") || "",
                  // Note: WaitlistGuest schema uses 'email', Guest uses 'emailAddress'
                  email: guest.email || null, 
                  relation: guest.relationship || null,
                };
              }),
            },
          },
          include: {
            guests: true,
          }
        });

        // Return a specific structure so frontend knows it was a waitlist
        return { status: "waitlisted", data: waitlistEntry };
      }

      // --- SCENARIO B: SIGNUP (Spots Available) ---
      
      const newSignup = await tx.eventSignup.create({
        data: {
          userId,
          positionId,
          eventId: position.eventId,
          hasGuests: (guests && guests.length > 0), // Helper flag from your schema
          guests: {
            create: guests.map((guest: GuestInput) => {
              const nameParts = guest.fullName.trim().split(" ");
              return {
                positionId,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(" ") || "",
                emailAddress: guest.email || null,
                phoneNumber: guest.phoneNumber || null,
                relation: guest.relationship || null,
              };
            }),
          },
        },
        include: {
          guests: true,
        },
      });

      // Increment the count
      await tx.eventPosition.update({
        where: { id: positionId },
        data: {
          filledSlots: { increment: spotsNeeded },
        },
      });

      return { status: "registered", data: newSignup };
    });

    // 4. Return the result
    // We check the status we returned from the transaction to set the HTTP code if needed
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Failed to process registration:", error);
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
    // 1. Get the Registration ID from the URL query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing registration ID" }, { status: 400 });
    }

    // 2. Get the new list of guests from the body
    const { guests } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      // A. Fetch the EXISTING registration to check current counts
      const currentSignup = await tx.eventSignup.findUnique({
        where: { id },
        include: { guests: true }, 
      });

      if (!currentSignup) {
        throw new Error("Registration not found");
      }

      // B. Calculate the Net Difference in slots
      const oldGuestCount = currentSignup.guests.length;
      const newGuestCount = guests?.length || 0;
      const spotDifference = newGuestCount - oldGuestCount;

      // C. DELETE all existing guests for this signup (Wipe clean)
      // Ensure your Guest model has 'signupId' relation
      await tx.guest.deleteMany({
        where: { signupId: id }, 
      });

      // D. RE-CREATE the guests from the new payload
      const updatedSignup = await tx.eventSignup.update({
        where: { id },
        data: {
          guests: {
            create: guests.map((guest: GuestInput) => {
              const nameParts = guest.fullName.trim().split(" ");
              return {
                positionId: currentSignup.positionId, 
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(" ") || "",
                emailAddress: guest.email || null,
                phoneNumber: guest.phoneNumber || null,
                relation: guest.relationship || null,
              };
            }),
          },
        },
        include: { guests: true },
      });

      // E. UPDATE the Slots ONLY if the count changed
      if (spotDifference !== 0) {
        await tx.eventPosition.update({
          where: { id: currentSignup.positionId },
          data: {
            filledSlots: { increment: spotDifference },
          },
        });
      }

      return updatedSignup;
    });

    // Return the same structure so frontend doesn't break
    return NextResponse.json({ status: "registered", data: result }, { status: 200 });

  } catch (error) {
    console.error("Failed to update registration:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}