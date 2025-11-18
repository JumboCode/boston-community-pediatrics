import { z } from "zod";

// Single position schema
export const positionSchema = z.object({
  name: z.string().min(1, "Position name is required"),
  date: z.string().optional(),
  time: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  apt: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  participants: z
    .string()
    .regex(/^\d+$/, "Must be a number")
    .optional(),
  sameAsDate: z.boolean(),
  sameAsTime: z.boolean(),
  sameAsAddress: z.boolean(),
});

// Event schema
export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Event date is required"),
  time: z.string().min(1, "Event time is required"),
  description: z.string().optional(),
  resourcesLink: z.string().url().optional(),
  address: z.string().min(1, "Street address is required"),
  apt: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  positions: z.array(positionSchema).min(1, "At least one position is required"),
});
