// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "./controller";

// TODO: CORRECT ERROR CODES and STATUS

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id: string | undefined = searchParams.get("id") || undefined;

  if (id) {
    try {
      const user = await getUserById(id);
      if (!user) {
        return NextResponse.json(
          {
            code: "NOT_FOUND",
            message: "Users not found",
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          code: "SUCCESS",
          data: { user },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        {
          code: "ERROR",
          message: error,
        },
        { status: 500 }
      );
    }
  }

  try {
    const users = await getUsers();
    if (!users) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "Users not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        code: "SUCCESS",
        data: { users },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        code: "ERROR",
        message: error,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await req.json();
    const newUser = await createUser(user);
    if (!newUser) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "User not created",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        code: "SUCCESS",
        data: { newUser },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        code: "ERROR",
        message: error,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, user } = await req.json();
    const updatedUser = await updateUser(id, user);
    if (!updatedUser) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "User not updated",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        code: "SUCCESS",
        data: { updatedUser },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        code: "ERROR",
        message: error,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "User not deleted",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        code: "SUCCESS",
        data: { deletedUser },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        code: "ERROR",
        message: error,
      },
      { status: 500 }
    );
  }
}
