import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch signups by event ID
export const getSignupsByEventId = async (eventId: string) => {
    const signups = await prisma.eventSignup.findMany({
      where: { eventId },
    });
    return signups
};

// Create event signup
export const createEventSignup = async (data: Prisma.EventSignUpCreateInput) => {
  return prisma.eventSignup.create({ data });
};

