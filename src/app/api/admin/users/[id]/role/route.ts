// src/app/api/admin/users/[id]/role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminUpdateUserRole } from "./controller";
import { getUserById } from "../../../../users/controller"
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  try { 
    const { id, role } = await req.json();
    let isAdmin = false;
    const currentUser = await getCurrentUser();
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    } else return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (currentUser.id == id) {
      return NextResponse.json({ error: "Cannot change own role" }, { status: 403 });
    }

    const updatedUser = await adminUpdateUserRole(id, role);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not updated" }, { status: 404 });
    }
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id: string | undefined = searchParams.get("id") || undefined;

  if (id) {
    try {
      const user = await getUserById(id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      let isAdmin = false;
      const currentUser = await getCurrentUser();
      if (currentUser) {
        if (currentUser.role === UserRole.ADMIN) {
          isAdmin = true;
        }
      }
      if (currentUser?.id != user.id && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(user, { status: 200 });
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }
  }
}