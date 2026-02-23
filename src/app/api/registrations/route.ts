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
  comments?: string | null;
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
                dateOfBirth: guest.dateOfBirth || null,
                comments: guest.comments || null,
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
              dateOfBirth: guest.dateOfBirth || null,
              comments: guest.comments || null,
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
        // TODO: What my colleague meant to say was replace this line with the
        // commented out one below it
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
                  dateOfBirth: guest.dateOfBirth || null,
                  comments: guest.comments || null,
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
                  dateOfBirth: guest.dateOfBirth || null,
                  comments: guest.comments || null,
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

// ==========================================
// GET: Fetch Registration(s)
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const positionId = searchParams.get("positionId");

    // ---------------------------------------------------------
    // SCENARIO A: Fetch ONE registration (Used by Register Page)
    // ---------------------------------------------------------
    if (userId && positionId) {
      // 1. Check Signup
      const signup = await prisma.eventSignup.findFirst({
        where: { userId, positionId },
        include: { guests: true },
      });

      if (signup) {
        // Normalize Guest Data
        const normalizedGuests = signup.guests.map((g) => ({
          id: g.id,
          firstName: g.firstName,
          lastName: g.lastName,
          email: g.emailAddress,
          phoneNumber: g.phoneNumber,
          relationship: g.relation,
          // FIX: Ensure we read from DB
          dateOfBirth: g.dateOfBirth || "", 
          comments: g.comments || "", 
        }));

        return NextResponse.json(
          { ...signup, guests: normalizedGuests, status: "registered" },
          { status: 200 }
        );
      }

      // 2. Check Waitlist
      const waitlist = await prisma.eventWaitlist.findFirst({
        where: { userId, positionId },
        include: { guests: true },
      });

      if (waitlist) {
        // Normalize Guest Data
        const normalizedGuests = waitlist.guests.map((g) => ({
          id: g.id,
          firstName: g.firstName,
          lastName: g.lastName,
          email: g.email,
          phoneNumber: "", // Waitlist schema usually doesn't have phone
          relationship: g.relation,
          // FIX: Ensure we read from DB (Previously this was hardcoded "")
          dateOfBirth: g.dateOfBirth || "", 
          comments: g.comments || "",       
        }));

        return NextResponse.json(
          { ...waitlist, guests: normalizedGuests, status: "waitlisted" },
          { status: 200 }
        );
      }

      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // SCENARIO B: Fetch ALL registrations (Used by Profile Page)
    // ---------------------------------------------------------
    if (userId) {
      const signups = await prisma.eventSignup.findMany({
        where: { userId },
        include: {
          guests: true,
          position: {
            // This include fetches ALL fields in Position (including startTime/endTime)
            include: { 
                // This include fetches ALL fields in Event (including name, address, etc.)
                event: true 
            },
          },
        },
      });

      const waitlists = await prisma.eventWaitlist.findMany({
        where: { userId },
        include: {
          guests: true,
          position: {
            include: { event: true },
          },
        },
      });

      // Combine and return
      const combined = [
        ...signups.map((s) => ({ ...s, type: "signup", status: "registered" })),
        ...waitlists.map((w) => ({ ...w, type: "waitlist", status: "waitlisted" })),
      ];

      return NextResponse.json(combined, { status: 200 });
    }

    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// ... (Your existing GET, POST, PUT code) ...

// ==========================================
// DELETE: Remove Registration & Auto-Promote
// ==========================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing registration ID" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      // ------------------------------------------------------------
      // CHECK 1: Is this a CONFIRMED Signup?
      // ------------------------------------------------------------
      const signup = await tx.eventSignup.findUnique({
        where: { id },
        include: { guests: true },
      });

      if (signup) {
        const positionId = signup.positionId;

        // ==================================================================
        // 0. LOCK THE ROW (Prevent Race Conditions)
        // ==================================================================
        // This locks the specific EventPosition row. No other transaction 
        // can read or write to this position until this transaction finishes.
        // We use "EventPosition" because that is the default table name in DB.
        await tx.$queryRaw`SELECT 1 FROM "EventPosition" WHERE id = ${positionId} FOR UPDATE`;

        // 1. Calculate how many slots are opening up
        const slotsFreed = 1 + signup.guests.length;

        // 2. Delete the signup and its guests
        await tx.guest.deleteMany({ where: { signupId: id } });
        await tx.eventSignup.delete({ where: { id } });

        // 3. Decrement filledSlots temporarily
        // (The lock above ensures no one else sees this temporary state)
        const position = await tx.eventPosition.update({
          where: { id: positionId },
          data: { filledSlots: { decrement: slotsFreed } },
        });

        // ----------------------------------------------------------
        // AUTO-PROMOTION LOGIC
        // ----------------------------------------------------------
        // Fetch waitlist candidates, ordered by creation time (FIFO)
        const waitlistCandidates = await tx.eventWaitlist.findMany({
          where: { positionId },
          include: { guests: true },
          orderBy: { createdAt: "asc" }, // Ensure you ran `db push` for this field
        });

        let currentFilled = position.filledSlots;
        const totalSlots = position.totalSlots;
        let slotsAvailable = totalSlots - currentFilled;

        for (const candidate of waitlistCandidates) {
          const spotsNeeded = 1 + candidate.guests.length;

          // If the candidate fits in the available slots...
          if (spotsNeeded <= slotsAvailable) {
            // A. Move to Signup
            await tx.eventSignup.create({
              data: {
                userId: candidate.userId,
                positionId: candidate.positionId,
                eventId: position.eventId, 
                hasGuests: candidate.guests.length > 0,
                guests: {
                  create: candidate.guests.map((g) => ({
                    positionId: candidate.positionId,
                    firstName: g.firstName,
                    lastName: g.lastName,
                    emailAddress: g.email,
                    relation: g.relation,
                    dateOfBirth: g.dateOfBirth,
                    comments: g.comments,
                  })),
                },
              },
            });

            // B. Remove from Waitlist
            await tx.waitlistGuest.deleteMany({ where: { waitlistId: candidate.id } });
            await tx.eventWaitlist.delete({ where: { id: candidate.id } });

            // C. Update counters
            slotsAvailable -= spotsNeeded;
            currentFilled += spotsNeeded;

            // Update the DB count
            await tx.eventPosition.update({
              where: { id: positionId },
              data: { filledSlots: { increment: spotsNeeded } },
            });
          } else {
            // Strict FIFO: Stop if the next person doesn't fit
            break; 
          }
        }

        return { message: "Registration removed and waitlist processed." };
      }

      // ------------------------------------------------------------
      // CHECK 2: Is this a WAITLIST Entry?
      // ------------------------------------------------------------
      const waitlistEntry = await tx.eventWaitlist.findUnique({
        where: { id },
      });

      if (waitlistEntry) {
        // Just delete it. No need to lock position because removing a waitlist 
        // entry doesn't affect the filledSlots count.
        await tx.waitlistGuest.deleteMany({ where: { waitlistId: id } });
        await tx.eventWaitlist.delete({ where: { id } });
        return { message: "Removed from waitlist." };
      }

      throw new Error("Registration not found");
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Delete failed:", error);
    const is404 = error instanceof Error && error.message === "Registration not found";
    return NextResponse.json(
      { error: is404 ? "Registration not found" : "Failed to remove registration" }, 
      { status: is404 ? 404 : 500 }
    );
  }
}
