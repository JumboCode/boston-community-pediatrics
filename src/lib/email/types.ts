export type EmailType = "signup" | "waitlist" | "removed" | "reminder" | "other";

export type EmailData = {
  firstName?: string;
  eventName?: string;
  eventDate?: string;
  position?: string;
  startTime?: string;
  endTime?: string;
  filledSlots?: number;
  location?: string;
  waitlistPosition?: number;
  eventImage?: string;
};

export type SendEmailProps = {
  recipients: string[];
  subject: string;
  type?: EmailType;
  html?: string;
  data?: EmailData;
};
