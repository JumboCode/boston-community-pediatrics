import "server-only";

import { Resend } from "resend";
import { SendEmailProps } from "./types";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined");
}

const from = process.env.EMAIL_FROM;
if (!from) {
  throw new Error("EMAIL_FROM is not defined");
}

const resend = new Resend(apiKey);

export async function sendEmail(props: SendEmailProps) {
  const recipients = props.recipients;
  const subject = props.subject;
  const html = props.html;

  if (!recipients) {
    throw new Error("Recipients are required");
  }

  if (!subject) {
    throw new Error("Subject is required");
  }

  if (!html) {
    throw new Error("Email content is required");
  }

  const res = await resend.emails.send({
    from: from as string,
    to: recipients,
    subject,
    html,
  });
  return {
    res,
  };
}
