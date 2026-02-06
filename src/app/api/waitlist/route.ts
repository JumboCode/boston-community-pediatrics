import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const positionId = searchParams.get("positionId");

//   if (!positionId) {
//     return NextResponse.json(
//       { error: "Missing positionId" },
//       { status: 400 }
//     );
//   }

//   const rows = await prisma.eventWaitlist.findMany({
//     where: { positionId },
//     orderBy: { createdAt: "asc" },
//   });

//   return NextResponse.json(rows);
// }



export async function GET() {
  return NextResponse.json([
    {
      signupId: "wl_001",
      id: "user_101",
      firstName: "Jordan",
      lastName: "Lee",
      emailAddress: "jordan.lee@example.com",
      phoneNumber: "617-555-0199",
    },
    {
      signupId: "wl_002",
      id: "user_102",
      firstName: "Aisha",
      lastName: "Khan",
      emailAddress: "aisha.khan@example.com",
      phoneNumber: "617-555-0234",
    },
    {
      signupId: "wl_003",
      id: "user_103",
      firstName: "Miguel",
      lastName: "Santos",
      emailAddress: "miguel.santos@example.com",
      phoneNumber: "617-555-0412",
    },
  ]);
}
