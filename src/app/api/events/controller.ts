import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all events
export const getEvents = async () => {
  return prisma.event.findMany();
};

// Fetch event by ID
export const getEventById = async (id: string) => {
  return prisma.event.findUnique({ where: { id } });
};

// CREATE event
export const createEvent = async (data: Prisma.EventCreateInput) => {
  return prisma.event.create({ data });
};

// UPDATE event
type EditableEventFields = Pick<
  Prisma.EventUpdateInput,
  | "name"
  | "description"
  | "date"
  | "startTime"
  | "endTime"
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "state"
  | "country"
  | "zipCode"
  | "lat"
  | "lng"
>;

export const updateEvent = async (id: string, data: EditableEventFields) => {
  return prisma.event.update({
    where: { id },
    data,
  });
};

export const updateEventImage = async (eventId: string, imageKey: string) => {
  await prisma.event.update({
    where: { id: eventId },
    data: {
      images: { push: imageKey },
    },
  });
};

export const removeEventImage = async (eventId: string, imageKey: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");

  const updatedImages = event.images.filter((key) => key !== imageKey);

  return prisma.event.update({
    where: { id: eventId },
    data: { images: { set: updatedImages } },
  });
};

// DELETE event
export const deleteEvent = async (id: string) => {
  return prisma.event.delete({ where: { id } });
};
