import { User, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
}

export async function createUser(user: User) {
  const newUser = await prisma.user.create({
    data: { ...user },
  });
  return newUser;
}

export async function updateUser(id: string, user: User) {
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
}

export async function deleteUser(id: string) {
  const deletedUser = await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return deletedUser;
}
