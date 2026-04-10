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

function isFutureDate(value?: string | null) {
  if (!value) return false;
  const input = new Date(value);
  if (Number.isNaN(input.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  input.setHours(0, 0, 0, 0);
  return input > today;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id: string | undefined = searchParams.get("id") || undefined;

  // this cuz we just want ids for send email stuff
  const list = searchParams.get("list");
  if (list === "1") {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await getUsers();

    // return minimal fields only
    const minimal = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      emailAddress: u.emailAddress,
    }));

    minimal.sort((a, b) => {
      const al = a.lastName.toLowerCase();
      const bl = b.lastName.toLowerCase();
      if (al !== bl) return al.localeCompare(bl);
      return a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase());
    });

    return NextResponse.json(minimal, { status: 200 });
  }

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
    const currentUser = await getCurrentUser();

    if (currentUser && currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    // Validate phone number
    if (!user.phoneNumber || !/^[0-9]+$/.test(user.phoneNumber)) {
      return NextResponse.json(
        { error: "Phone number is required and must contain only numbers" },
        { status: 400 }
      );
    }

    if (isFutureDate(user.dateOfBirth)) {
      return NextResponse.json(
        { error: "Date of birth cannot be in the future" },
        { status: 400 }
      );
    }

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

    // Validate phone number if it's being updated and is different from current
    if (body.phoneNumber !== undefined) {
      // Fetch current user to check if phone is actually changing
      const existingUser = await getUserById(id);
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Only validate if the phone number is actually changing
      if (body.phoneNumber !== existingUser.phoneNumber) {
        if (!body.phoneNumber || !/^[0-9]+$/.test(body.phoneNumber)) {
          return NextResponse.json(
            { error: "Phone number must contain only numbers" },
            { status: 400 }
          );
        }
      }
    }

    if (body.dateOfBirth !== undefined && isFutureDate(body.dateOfBirth)) {
      return NextResponse.json(
        { error: "Date of birth cannot be in the future" },
        { status: 400 }
      );
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
