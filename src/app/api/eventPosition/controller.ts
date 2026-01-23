import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPositionById(id: string) {
  return await prisma.eventPosition.findUnique({
    where: { id },
    include: {
      event: true,
    },
  });
}

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

// Decrement filledSlots, used when a signup is deleted
export async function decrementEventPositionCount(positionId: string) {
  return prisma.eventPosition.update({
    where: { id: positionId },
    data: {
      filledSlots: { decrement: 1 },
    },
  });
}
