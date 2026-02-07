import "server-only";
import { sendEmail } from "./resend";

export type WaitlistedArgs = {
  to: string;
  firstName?: string;
  eventName: string;
  position: string;
  date: string;
  startTime: string;
  endTime: string;
  filledSlots: number;
  location: string;
  waitlistPosition: number;
};

export async function sendWaitlisted(args: WaitlistedArgs) {
  return sendEmail({
    recipients: [args.to],
    subject: `Waitlisted: ${args.eventName}`,
    type: "waitlist",
    data: {
      firstName: args.firstName,
      eventName: args.eventName,
      position: args.position,
      eventDate: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      filledSlots: args.filledSlots,
      location: args.location,
      waitlistPosition: args.waitlistPosition,
    },
  });
}
