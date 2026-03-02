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
export async function getUsersByPositionId(
  positionId: string,
  isAdmin: boolean
) {
  const signups = await prisma.eventSignup.findMany({
    where: { positionId },
    include: {
      user: true,
      guests: true,
    },
  });

  const safeSignups = signups.filter(
    (s): s is typeof s & { user: User } => s.user !== null
  );

  if (isAdmin) {
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
  guestOf?: string;
  isGuest?: boolean;
}

function adminUserWithGuests(s: {
  id: string;
  user: User;
  guests: Guest[];
}): AdminUser[] {
  const mainUser: AdminUser = {
    id: s.user.id,
    signupId: s.id,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    emailAddress: s.user.emailAddress,
    phoneNumber: s.user.phoneNumber,
  };

  const guestUsers: AdminUser[] = s.guests.map((guest) => ({
    id: guest.id,
    signupId: s.id,
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
  id: string;
  signupId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  guests: PublicGuest[];
}

export interface PublicGuest {
  id: string;
  firstName: string;
  lastName: string;
}

function publicUser(s: { id: string; user: User; guests: Guest[] }): PublicUser {
  return {
    id: s.user.id,
    signupId: s.id,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    profileImage: s.user.profileImage ?? null,
    guests: s.guests.map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
    })),
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

// Delete event signup - handle Guest foreign key
export const deleteEventSignup = async (eventSignupId: string) => {
  await prisma.guest.deleteMany({
    where: { signupId: eventSignupId },
  });
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