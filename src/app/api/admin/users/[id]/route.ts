import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, route } from "@/lib/auth";
import { deleteUser } from "./controllers";

export const DELETE = route(async (req: NextRequest) => {
  await requireAdmin();

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const deletedUser = await deleteUser(id);
  if (!deletedUser) {
    return NextResponse.json({ error: "User not deleted" }, { status: 404 });
  }
  return NextResponse.json(deletedUser, { status: 200 });
});
