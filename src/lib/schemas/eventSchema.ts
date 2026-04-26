import { z } from "zod";

/** Shared limits for create-event form + POST /api/events validation */
export const EVENT_FIELD_LIMITS = {
  title: 200,
  description: 8000,
  address: 300,
  apt: 100,
  city: 100,
  state: 50,
  zipMinDigits: 5,
  zipMaxDigits: 9,
  positionName: 200,
  resourcesLink: 2048,
  /** Max digits for participant count string (e.g. up to 999999) */
  participantsMaxDigits: 6,
} as const;

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM");

const yyyymmdd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

function endDateTimeAfterStart(
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
) {
  if (endDate > startDate) return true;
  if (endDate === startDate) return endTime > startTime;
  return false;
}

const zipCodeSchema = z
  .string()
  .min(
    EVENT_FIELD_LIMITS.zipMinDigits,
    `Zip code must be at least ${EVENT_FIELD_LIMITS.zipMinDigits} digits`,
  )
  .max(
    EVENT_FIELD_LIMITS.zipMaxDigits,
    `Zip code must be at most ${EVENT_FIELD_LIMITS.zipMaxDigits} digits`,
  )
  .regex(/^\d+$/, "Zip code must contain only numbers");

export const positionSchema = z
  .object({
    name: z
      .string()
      .min(1, "Position name is required")
      .max(EVENT_FIELD_LIMITS.positionName, "Position name is too long"),
    startDate: yyyymmdd,
    endDate: yyyymmdd,

    startTime: hhmm,
    endTime: hhmm,

    description: z
      .string()
      .min(1, "Description is required")
      .max(EVENT_FIELD_LIMITS.description, "Description is too long"),
    address: z
      .string()
      .min(1, "Street address is required")
      .max(EVENT_FIELD_LIMITS.address, "Street address is too long"),
    apt: z.string().max(EVENT_FIELD_LIMITS.apt, "Apt / suite is too long").default(""),
    city: z
      .string()
      .min(1, "City is required")
      .max(EVENT_FIELD_LIMITS.city, "City is too long"),
    state: z
      .string()
      .min(1, "State is required")
      .max(EVENT_FIELD_LIMITS.state, "State is too long"),
    zip: zipCodeSchema,
    participants: z
      .string()
      .regex(/^\d+$/, "Must be a number")
      .min(1, "Must be a number")
      .max(
        EVENT_FIELD_LIMITS.participantsMaxDigits,
        "Maximum participants value is too large",
      ),
    sameAsDate: z.boolean(),
    sameAsTime: z.boolean(),
    sameAsAddress: z.boolean(),
  })
  .refine(
    (p) => endDateTimeAfterStart(p.startDate, p.endDate, p.startTime, p.endTime),
    {
      message: "End date/time must be after start date/time",
      path: ["endTime"],
    }
  )
  .refine((p) => !p.startDate || !p.endDate || p.startDate === p.endDate, {
    message: "Positions cannot span multiple days",
    path: ["endDate"],
  });

export const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Event title is required")
      .max(EVENT_FIELD_LIMITS.title, "Event title is too long"),
    startDate: yyyymmdd,
    endDate: yyyymmdd,

    startTime: hhmm,
    endTime: hhmm,

    description: z
      .string()
      .max(EVENT_FIELD_LIMITS.description, "Description is too long")
      .optional(),
    resourcesLink: z.preprocess(
      (v) => {
        if (v == null) return "";
        if (typeof v !== "string") return v;
        return v.trim();
      },
      z
        .union([
          z.literal(""),
          z
            .string()
            .min(1)
            .max(
              EVENT_FIELD_LIMITS.resourcesLink,
              "Resources link is too long",
            )
            .url(
              "Use a full URL starting with https:// (or leave this field blank)",
            ),
        ])
        .optional(),
    ),
    address: z
      .string()
      .min(1, "Street address is required")
      .max(EVENT_FIELD_LIMITS.address, "Street address is too long"),
    apt: z.string().max(EVENT_FIELD_LIMITS.apt, "Apt / suite is too long").default(""),
    city: z
      .string()
      .min(1, "City is required")
      .max(EVENT_FIELD_LIMITS.city, "City is too long"),
    state: z
      .string()
      .min(1, "State is required")
      .max(EVENT_FIELD_LIMITS.state, "State is too long"),
    zip: zipCodeSchema,
    positions: z
      .array(positionSchema)
      .min(1, "At least one position is required"),
  })
  .refine(
    (e) => endDateTimeAfterStart(e.startDate, e.endDate, e.startTime, e.endTime),
    {
      message: "End date/time must be after start date/time",
      path: ["endTime"],
    }
  );
