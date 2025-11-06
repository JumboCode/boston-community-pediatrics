import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch signups by event ID
export const getSignupsByEventId = async (eventId: string) => {
  const signups = await prisma.eventSignup.findMany({
    where: { eventId },
  });
  return signups;
};

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
