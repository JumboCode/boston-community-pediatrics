import "server-only";
import { sendEmail } from "./resend";

export type ReminderArgs = {
  to: string;
  firstName?: string;
  eventName: string;
  position: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  eventImage?: string;
};

export async function sendReminder(args: ReminderArgs) {
  return sendEmail({
    recipients: [args.to],
    subject: `Reminder: You're volunteering tomorrow at ${args.eventName}`,
    type: "reminder",
    data: {
      firstName: args.firstName,
      eventName: args.eventName,
      position: args.position,
      eventDate: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      eventImage: args.eventImage,
    },
  });
}
