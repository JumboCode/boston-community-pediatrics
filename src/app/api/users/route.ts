// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createUser,
  getUserById,
  getUsers,
  updateUserProfile,
} from "./controller";
import {
  requireAdmin,
  requireSelfOrAdmin,
  route,
} from "@/lib/auth";
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

function normalizeProfileImageUrl(value?: string | null) {
  if (!value) return value ?? null;
  if (!value.startsWith("http")) return value;
  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    return url.toString();
  } catch {
    return value;
  }
}

export const GET = route(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id: string | undefined = searchParams.get("id") || undefined;
  const list = searchParams.get("list");

  // Minimal user list (id + name + email) used by the admin email composer.
  if (list === "1") {
    await requireAdmin();

    const users = await getUsers();

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

  // Single user by id: caller must be that user or an admin.
  if (id) {
    await requireSelfOrAdmin(id);

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  }

  // Full user list: admin only. The previous `if (currentUser && ...)` form
  // let unauthenticated callers fall through and read every user; using
  // requireAdmin() makes that impossible.
  await requireAdmin();

  const users = await getUsers();
  if (!users) {
    return NextResponse.json({ error: "Users not found" }, { status: 404 });
  }
  return NextResponse.json(users, { status: 200 });
});

export const POST = route(async (req: NextRequest) => {
  // This route CREATES the DB user, so we can't use requireUser() (which
  // assumes the user already exists). Fall back to Clerk's auth() directly.
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = await req.json();
  user.profileImage = normalizeProfileImageUrl(user.profileImage);

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

  // Force server-side values for identity & role so the client cannot:
  //   - create a row with someone else's Clerk id
  //   - promote themselves to ADMIN by sending role: "ADMIN"
  const safeUser = {
    ...user,
    id: clerkUserId,
    role: UserRole.VOLUNTEER,
  };

  const newUser = await createUser(safeUser);
  if (!newUser) {
    return NextResponse.json({ error: "User not created" }, { status: 500 });
  }
  return NextResponse.json(newUser, { status: 201 });
});

export const PUT = route(async (req: NextRequest) => {
  const payload = await req.json();
  const id = payload?.id as string | undefined;
  const body = payload?.body as Record<string, unknown> | undefined;

  if (!id || !body || typeof body !== "object") {
    return NextResponse.json(
      { error: "id and body are required" },
      { status: 400 }
    );
  }

  const currentUser = await requireSelfOrAdmin(id);
  const isAdmin = currentUser.role === UserRole.ADMIN;

  body.profileImage = normalizeProfileImageUrl(
    body.profileImage as string | null | undefined
  );

  // Validate phone number if it's being updated and is different from current
  if (body.phoneNumber !== undefined) {
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.phoneNumber !== existingUser.phoneNumber) {
      if (!body.phoneNumber || !/^[0-9]+$/.test(String(body.phoneNumber))) {
        return NextResponse.json(
          { error: "Phone number must contain only numbers" },
          { status: 400 }
        );
      }
    }
  }

  if (
    body.dateOfBirth !== undefined &&
    isFutureDate((body.dateOfBirth as string | null | undefined) ?? undefined)
  ) {
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
});
