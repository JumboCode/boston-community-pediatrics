import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch event positions by event ID
export const getPositionsByEventId = async (eventId: string) => {
    const eventPositions = await prisma.eventPosition.findMany({
      where: { eventId },
    });
    return eventPositions
};

// Create eventPosition
export const createEventPosition = async (data: Prisma.EventPositionCreateInput) => {
  return prisma.eventPosition.create({ data });
};