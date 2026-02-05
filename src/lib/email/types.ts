export type SendEmailProps = {
  recipients: string[];
  subject: string;
  html: string;
  type?: "signup" | "waitlist" | "other"; //idk but we can take out idk
  data: {
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
};
