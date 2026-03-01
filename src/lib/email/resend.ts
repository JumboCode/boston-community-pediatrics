import "server-only";
import React from "react";
import { Resend } from "resend";
import { SendEmailProps } from "./types";
import { SignupConfirmedTemplate } from "./templates/SignupConfirmed";
import { RemovedTemplate  } from "./templates/RemovedFromEvent";
import { WaitlistedTemplate } from "./templates/Waitlisted";
import { Text as EmailText, Section as EmailSection } from "@react-email/components";
import { BaseLayoutTemplate } from "./templates/BaseLayout";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined");
}

const from = process.env.EMAIL_FROM;
if (!from) {
  throw new Error("EMAIL_FROM is not defined");
}

const resend = new Resend(apiKey);


// ── Admin broadcast email — matches SignupConfirmedTemplate styling ────────────
function AdminMessageTemplate({ message }: { message: string }) {
  return React.createElement(
    BaseLayoutTemplate,
    null,
    React.createElement(
      EmailSection,
      { className: "py-8 px-10", style: { minHeight: "220px" }},
      
      React.createElement(
        EmailText,
        { className: "text-sm mt-0 mb-4" },
        "Dear Volunteer(s),"
      ),

      React.createElement(
        EmailText,
        {
          className: "text-sm mt-0 mb-8",
          style: { marginLeft: "10px", whiteSpace: "pre-line", lineHeight: "1.7"},
        },
        message
      ),
    )
  );
}

export async function sendEmail(props: SendEmailProps) {
  const { recipients, subject, type, data, html} = props;
  const d = data ?? {};
  let emailComponent: React.ReactElement;

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

      case "removed":
      emailComponent = React.createElement(RemovedTemplate, {
        firstName: d.firstName ?? "Guest",
        eventName: d.eventName ?? "Event",
        position: d.position ?? "Position TBD",
        startTime: d.startTime ?? "TBD",
        endTime: d.endTime ?? "TBD",
        date: d.eventDate ?? "TBD",
        location: d.location ?? "TBD",
      }); 
      break;

    case "other":
      if (!html) throw new Error("html is required for type=other");
      {
        // Strip any wrapping div tags the frontend may add
        const stripped = html
          .replace(/<div[^>]*>/gi, "")
          .replace(/<\/div>/gi, "")
          .trim();
        emailComponent = React.createElement(AdminMessageTemplate, { message: stripped });
      }
      break;

    default:
      throw new Error("Unknown email type");
  }

  const { data: emailData, error } = await resend.emails.send({
    from: from as string,
    to: recipients,
    subject,
    react: emailComponent,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { data: emailData };
}