import { User, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.log("hello", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user");
  }
}

export async function createUser(user: User) {
  try {
    const newUser = await prisma.user.create({
      data: { ...user },
    });
    return newUser;
  } catch (error) {
    throw new Error("Failed to create user");
  }
}

export async function updateUser(id: string, user: User) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        ...user,
        id: id,
      },
    });

    return updatedUser;
  } catch (error) {
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(id: string) {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return deletedUser;
  } catch (error) {
    throw new Error("Failed to delete user");
  }
}
