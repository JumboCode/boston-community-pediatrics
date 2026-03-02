// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  getUserById,
  getUsers,
  updateUserProfile,
} from "./controller";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

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

  try {
    const users = await getUsers();
    if (!users) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 });
    }
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await req.json();
    const newUser = await createUser(user);
    if (!newUser) {
      return NextResponse.json({ error: "User not created" }, { status: 500 });
    }
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, body } = await req.json();
    let isAdmin = false;
    const currentUser = await getCurrentUser();
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        isAdmin = true;
      }
    } else return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (currentUser?.id != id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let filteredBody = body;
    // Non-admins can only update certain fields
    if (!isAdmin) {
      const allowedFields = [
        "firstName",
        "lastName",
        "phoneNumber",
        "dateOfBirth",
        "streetAddress",
        "city",
        "state",
        "country",
        "zipCode",
        "profileImage",
        "speaksSpanish",
      ];
      filteredBody = Object.fromEntries(
        Object.entries(body).filter(([key]) => allowedFields.includes(key))
      );
    }
    const updatedUser = await updateUserProfile(id, filteredBody);
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
