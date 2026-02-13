import { Prisma, PrismaClient } from "@prisma/client";
import { User, Guest } from "@prisma/client";
const prisma = new PrismaClient();

// Fetch signups by event ID
export const getSignupsByEventId = async (eventId: string) => {
  const signups = await prisma.eventSignup.findMany({
    where: { eventId },
  });
  return signups;
};

export async function getSignupsByUserId(userId: string) {
  const signups = await prisma.eventSignup.findMany({
    where: { userId },
    include: { event: true },
  });
  return signups;
}

// Fetch user signups by event position
// Updated getUsersByPositionId to include guest information
export async function getUsersByPositionId(
  positionId: string,
  isAdmin: boolean
) {
  const signups = await prisma.eventSignup.findMany({
    where: { positionId },
    include: {
      user: true,
      guests: true, // Include guests
    },
  });

  const safeSignups = signups.filter(
    (s): s is typeof s & { user: User } => s.user !== null
  );

  if (isAdmin) {
    // FIXED: Use flatMap to flatten the array of arrays
    return safeSignups.flatMap((s) => adminUserWithGuests(s));
  }
  return safeSignups.map((s) => publicUser(s));
}

// Updated AdminUser interface to include guest info
export interface AdminUser {
  id: string;
  signupId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  guestOf?: string; // For displaying "Guest of X"
  isGuest?: boolean; // To mark if this row is a guest
}

function adminUserWithGuests(s: {
  id: string;
  user: User;
  guests: Guest[];
}): AdminUser[] {
  // Return an array: main user + their guests
  const mainUser: AdminUser = {
    id: s.user.id,
    signupId: s.id,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    emailAddress: s.user.emailAddress,
    phoneNumber: s.user.phoneNumber,
  };

  const guestUsers: AdminUser[] = s.guests.map((guest) => ({
    id: guest.id, // Use guest.id for unique key
    signupId: s.id, // Same signup ID as the main user
    firstName: guest.firstName,
    lastName: guest.lastName,
    emailAddress: guest.emailAddress || "",
    phoneNumber: guest.phoneNumber || "",
    guestOf: `${s.user.firstName} ${s.user.lastName}`,
    isGuest: true,
  }));

  return [mainUser, ...guestUsers];
}

export interface PublicUser {
  id: string; // user id
  signupId: string; // signup row id (needed for selection)
  firstName: string;
  lastName: string;
}

function publicUser(s: { id: string; user: User }): PublicUser {
  return {
    id: s.user.id,
    signupId: s.id,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
  };
}

// Create event signup
export const createEventSignup = async (
  data: Prisma.EventSignupCreateInput
) => {
  return prisma.eventSignup.create({ data });
};

// Update event signup
export const updateEventSignup = async (
  eventSignupId: string,
  data: Prisma.EventSignupUpdateInput
) => {
  const eventSignup = await prisma.eventSignup.update({
    where: { id: eventSignupId },
    data,
  });
  return eventSignup;
};

// Delete event signup - UPDATED to handle Guest foreign key
export const deleteEventSignup = async (eventSignupId: string) => {
  // First delete any associated guests
  await prisma.guest.deleteMany({
    where: { signupId: eventSignupId },
  });

  // Then delete the signup
  const deletedEventSignup = await prisma.eventSignup.delete({
    where: { id: eventSignupId },
  });

  return deletedEventSignup;
};

export const createWaitlistSignup = async (
  positionId: string,
  userId: string
) => {
  return prisma.eventWaitlist.create({
    data: {
      positionId,
      userId,
    },
  });
};
