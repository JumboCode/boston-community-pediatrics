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

// Fetch user signups by event position
export async function getUsersByPositionId(positionId: string) {

  const signups = await prisma.eventSignup.findMany({
    where: { positionId },
    include: { user: true },
  });

   const users = signups
    .map((s) => s.user)
    .filter((u): u is User => u !== null) 
    .map(publicUser);
  return users;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
}

function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

// Fetch user signups by event position
export async function getUsersByPositionId(positionId: string) {
  const signups = await prisma.eventSignup.findMany({
    where: { positionId },
    include: { user: true },
  });
  

   const users = signups
    .map((s) => s.user)
    .filter((u): u is User => u !== null) 
    .map(publicUser);
  return users;
}

function publicUser(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
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
