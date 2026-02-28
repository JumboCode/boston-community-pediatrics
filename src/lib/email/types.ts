export type EmailType = "signup" | "waitlist" | "removed"|"other";

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
};

export type SendEmailProps = {
  recipients: string[];
  subject: string;
  type?: EmailType;
  html?: string;
  data?: EmailData;
};
