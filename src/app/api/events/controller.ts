import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET all events\
export const getEvents = async () => {
  return prisma.event.findMany();
};

// Fetch event by ID
export const getEventById = async (id: string) => {
  return prisma.event.findUnique({ where: { id } });
};

// CREATE event
export const createEvent = async (data: any) => {
  return prisma.event.create({ data });
};


// UPDATE event
export const updateEvent = async (id: string, data: any) => {
  return prisma.event.update({
    where: { id },
    data,
  });
};

// DELETE event
export const deleteEvent = async (id: string) => {
  return prisma.event.delete({ where: { id } });
};
