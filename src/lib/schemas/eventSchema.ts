import { z } from "zod";

// TODO: make this better in UI
const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM");

const yyyymmdd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

// Single position schema
export const positionSchema = z.object({
  name: z.string().min(1, "Position name is required"),
  date: yyyymmdd,
  time: hhmm,
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Street address is required"),
  apt: z.string().optional().or(z.literal("")),
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
  title: z.string().min(1, "Event title is required"),
  date: yyyymmdd,
  time: hhmm,
  description: z.string().optional(),
  resourcesLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  address: z.string().min(1, "Street address is required"),
  apt: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
  positions: z
    .array(positionSchema)
    .min(1, "At least one position is required"),
});
