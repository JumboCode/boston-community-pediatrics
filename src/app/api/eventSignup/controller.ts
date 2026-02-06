import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch signups by event ID
export const getSignupsByEventId = async (eventId: string) => {
  const signups = await prisma.eventSignup.findMany({
    where: { eventId },
  });
  return signups;
};

export async function getSignupsByUserId(
  userId: string
){
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
    include: { user: true },
  });

  const safeSignups = signups.filter(
    (s): s is typeof s & { user: User } => s.user !== null
  );

  if (isAdmin) {
    return safeSignups.map((s) => adminUser(s));
  }

  return safeSignups.map((s) => publicUser(s));
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
}

function publicUser(s: { user: User }) {
  return {
    id: s.user.id,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
  };
}

export interface AdminUser {
  id: string;
  signupId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
}

function adminUser(s: { id: string; user: User }): AdminUser {
  return {
    id: s.user.id,
    signupId: s.id,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    emailAddress: s.user.emailAddress,
    phoneNumber: s.user.phoneNumber,
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

// Delete event signup
export const deleteEventSignup = async (eventSignupId: string) => {
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

