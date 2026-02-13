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
};

export async function sendSignupConfirmed(args: SignupConfirmedArgs) {
  return sendEmail({
    recipients: [args.to],
    subject: `Confirmed: ${args.eventName}`,
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
