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
  const { recipients, subject, type, data } = props;
  let emailComponent;

  switch (type) {
    case "signup":
      emailComponent = React.createElement(SignupConfirmedTemplate, {
        firstName: data.firstName ?? "Guest",
        eventName: data.eventName ?? "Event",
        position: data.position ?? "Position TBD",
        startTime: data.startTime ?? "TBD",
        endTime: data.endTime ?? "TBD",
        date: data.eventDate ?? "TBD",
        filledSlots: data.filledSlots ?? 0,
        location: data.location ?? "TBD",
      });
      break;

    case "waitlist":
      emailComponent = React.createElement(WaitlistedTemplate, {
        firstName: data.firstName ?? "Guest",
        eventName: data.eventName ?? "Event",
        position: data.position ?? "Position TBD",
        startTime: data.startTime ?? "TBD",
        endTime: data.endTime ?? "TBD",
        date: data.eventDate ?? "TBD",
        filledSlots: data.filledSlots ?? 0,
        location: data.location ?? "TBD",
        waitlistPosition: data.waitlistPosition ?? 0,
      });
      break;

    default:
      throw new Error("Unknown email type");
  }

  
  const res = await resend.emails.send({
    from: from as string,
    to: recipients,
    subject,
    react: emailComponent,
  });
  return {
    res,
  };
}





// export async function sendEmail(props: SendEmailProps) {
//   const { recipients, subject, type, data, html } = props;
  
//   let emailComponent;

//   if (type === "signup") {
//     emailComponent = SignupConfirmedTemplate({
//       firstName: data.firstName ?? "human",
//       eventName: data.eventName ?? "Event",
//       position: data?.position ?? "Position TBD",
//       startTime: data.startTime ?? "TBD",
//       endTime: data.endTime ?? "TBD",
//       date: data?.eventDate ?? "TBD",
//       filledSlots: data.filledSlots ?? 0,
//       location: data.location ?? "TBD",
//     }); 
//   } else if (type === "waitlist") {
//     emailComponent = WaitlistedTemplate({
//       firstName: data?.firstName,
//       eventName: data?.eventName ?? "Event",
//     });
//   } else {
//     emailComponent = (
//       <BaseLayoutTemplate>
//         <Section
//           className="px-8 py-6"
//           dangerouslySetInnerHTML={{ __html: html ?? "" }}
//         />
//       </BaseLayoutTemplate>
//     );
//   }

//   if (!recipients) {
//     throw new Error("Recipients are required");
//   }

//   if (!subject) {
//     throw new Error("Subject is required");
//   }

//   if (!emailComponent) {
//     throw new Error("Email content is required");
//   }


//   const res = await resend.emails.send({
//     from: from as string,
//     to: recipients,
//     subject,
//     react: emailComponent,
//   });
//   return {
//     res,
//   };

