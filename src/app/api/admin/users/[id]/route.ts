import { NextRequest, NextResponse } from "next/server";
import { deleteUser } from "./controllers";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    console.log(id);
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "User not deleted" }, { status: 404 });
    }
    return NextResponse.json(deletedUser, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
