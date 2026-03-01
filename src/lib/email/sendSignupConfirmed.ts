import "server-only";
import { sendEmail } from "./resend";

export type SignupConfirmedArgs = {
  to: string;
  firstName?: string;
  eventName: string;
  position: string;
  date: string;
  startTime: string;
  endTime: string;
  filledSlots: number;
  location: string;
  wasWaitlisted?: boolean;
};

export async function sendSignupConfirmed(args: SignupConfirmedArgs) {
  return sendEmail({
    recipients: [args.to],
    subject: args.wasWaitlisted
    ? `Waitlist Status Update: Now Confirmed For ${args.eventName}`
    : `Confirmed: ${args.eventName}`,
    type: "signup",
    data: {
      firstName: args.firstName,
      eventName: args.eventName,
      position: args.position,
      eventDate: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      filledSlots: args.filledSlots,
      location: args.location,
    },
  });
}
