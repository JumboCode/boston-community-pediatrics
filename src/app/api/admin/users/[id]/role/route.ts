// src/app/api/admin/users/[id]/role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminUpdateUserRole } from "./controller";
import { getUserById } from "../../../../users/controller";
import { requireAdmin, requireSelfOrAdmin, route } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export const PATCH = route(async (req: NextRequest) => {
  const admin = await requireAdmin();

  const { id, role } = await req.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!role || !Object.values(UserRole).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (admin.id === id) {
    return NextResponse.json(
      { error: "Cannot change own role" },
      { status: 403 }
    );
  }

  const updatedUser = await adminUpdateUserRole(id, role);
  if (!updatedUser) {
    return NextResponse.json({ error: "User not updated" }, { status: 404 });
  }
  return NextResponse.json(updatedUser, { status: 200 });
});

export const GET = route(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await requireSelfOrAdmin(id);

  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user, { status: 200 });
});
