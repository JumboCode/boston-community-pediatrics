import { z } from "zod";

// Single position schema
export const positionSchema = z.object({
  name: z.string().min(1, "Position name is required"),
  date: z.string().min(1, "Date name is required"),
  startTime: z.iso.datetime().min(1, "Start time is required"),
  endTime: z.iso.datetime().min(1, "End time is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Street address is required"),
  apt: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  participants: z.string().regex(/^\d+$/, "Must be a number"),
  sameAsDate: z.boolean(),
  sameAsTime: z.boolean(),
  sameAsAddress: z.boolean(),
});

// Event schema
export const eventSchema = z.object({
  name: z.string().min(1, "Event title is required"),
  date: z.array(z.iso.datetime()).min(1, "At least one date for the event"),
  startTime: z.iso.datetime().min(1, "Event start time is required"),
  endTime: z.iso.datetime().min(1, "Event end time is required"),
  description: z.string().optional(),
  resourcesLink: z.url().or(z.literal("")),
  address: z.string().min(1, "Street address is required"),
  apt: z.string().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  positions: z
    .array(positionSchema)
    .min(1, "At least one position is required"),
});
