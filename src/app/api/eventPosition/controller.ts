import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch event positions by event ID
export const getPositionsByEventId = async (eventId: string) => {
  const eventPositions = await prisma.eventPosition.findMany({
    where: { eventId },
  });
  return eventPositions;
};

// Create eventPosition
export const createEventPosition = async (
  data: Prisma.EventPositionCreateInput
) => {
  return prisma.eventPosition.create({ data });
};

// Update eventPosition
export const updateEventPosition = async (
  id: string,
  data: Prisma.EventPositionUpdateInput
) => {
  return prisma.eventPosition.update({
    where: { id },
    data,
  });
};

// Delete eventPosition
export const deleteEventPosition = async (id: string) => {
  return prisma.eventPosition.delete({ where: { id } });
};
