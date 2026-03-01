import "server-only";
import { sendEmail } from "./resend";

export type RemovedFromEventArgs = {
  to: string;
  firstName?: string;
  eventName: string;
  position: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  wasWaitlisted?: boolean;
};

export async function sendRemoved(args: RemovedFromEventArgs) {
  return sendEmail({
    recipients: [args.to],
    subject: args.wasWaitlisted
    ? `Waitlist Position Removed: ${args.eventName}`
    : `Removed: ${args.eventName}`,
    type: "removed",
    data: { 
      firstName: args.firstName,
      eventName: args.eventName,
      position: args.position,
      eventDate: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
    },
  });
}
