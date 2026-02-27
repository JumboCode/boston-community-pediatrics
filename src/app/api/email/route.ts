import { sendEmail } from "@/lib/email/resend";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

const emailSchema = z.object({
  recipients: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  type: z.enum(["signup", "waitlist", "other"]).optional(), //for testing rn
  html: z.string().optional(),
  data: z
    .object({
      firstName: z.string().optional(),
      eventName: z.string().optional(),
      eventDate: z.string().optional(),
      position: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      filledSlots: z.number().optional(),
      location: z.string().optional(),
      waitlistPosition: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    // Make sure only admins can send emails
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== UserRole.ADMIN) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = emailSchema.parse(body);

    const result = await sendEmail(parsed);
    console.log("sendEmail result:", result);

    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", issues: err.issues },
        { status: 400 }
      );
    }

    const message =
      (err as Error)?.message ?? "Invalid request or email failed";

    const status = /daily email sending quota/i.test(message) ? 429 : 500;

    return Response.json({ error: message }, { status });
  }
}
