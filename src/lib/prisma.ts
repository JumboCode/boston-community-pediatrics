// lib/prisma.ts


import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  adapter: {
    url: process.env.DATABASE_URL!,
  },
});