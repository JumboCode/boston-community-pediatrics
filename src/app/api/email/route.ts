import { sendEmail } from "@/lib/email/resend";
import { z } from "zod";

const emailSchema = z.object({
  recipients: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = emailSchema.parse(body);

    const result = await sendEmail(parsed);
    console.log("sendEmail result:", result);

    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Invalid request or email failed" },
      { status: 500 }
    );
  }
}
