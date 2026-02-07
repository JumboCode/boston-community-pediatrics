import "server-only";
import React from "react";
import { Resend } from "resend";
import { SendEmailProps } from "./types";
import { SignupConfirmedTemplate } from "./templates/SignupConfirmed";
import { WaitlistedTemplate } from "./templates/Waitlisted";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined");
}

const from = process.env.EMAIL_FROM;
if (!from) {
  throw new Error("EMAIL_FROM is not defined");
}

const resend = new Resend(apiKey);

// Might be erased since again the backend should know if on waitlist or not
// since it literally knows when at capacity, but just to test you can change
// 'type' to "waitlist" or "signup" below

export async function sendEmail(props: SendEmailProps) {
  const { recipients, subject, type, data, html } = props;
  const d = data ?? {};
  let emailComponent;

  switch (type) {
    case "signup":
      emailComponent = React.createElement(SignupConfirmedTemplate, {
        firstName: d.firstName ?? "Guest",
        eventName: d.eventName ?? "Event",
        position: d.position ?? "Position TBD",
        startTime: d.startTime ?? "TBD",
        endTime: d.endTime ?? "TBD",
        date: d.eventDate ?? "TBD",
        filledSlots: d.filledSlots ?? 0,
        location: d.location ?? "TBD",
      });
      break;

    case "waitlist":
      emailComponent = React.createElement(WaitlistedTemplate, {
        firstName: d.firstName ?? "Guest",
        eventName: d.eventName ?? "Event",
        position: d.position ?? "Position TBD",
        startTime: d.startTime ?? "TBD",
        endTime: d.endTime ?? "TBD",
        date: d.eventDate ?? "TBD",
        filledSlots: d.filledSlots ?? 0,
        location: d.location ?? "TBD",
        waitlistPosition: d.waitlistPosition ?? 0,
      });
      break;
    case "other":
      if (!html) throw new Error("html is required for type=other");
      emailComponent = html;
      break;

    default:
      throw new Error("Unknown email type");
  }

  const { data: emailData, error } = await resend.emails.send({
    from: from as string,
    to: recipients,
    subject,
    ...(type === "other"
      ? { html: html as string }
      : { react: emailComponent }),
  });

  if (error) {
    throw new Error(error.message);
  }

  return { data: emailData };
}
