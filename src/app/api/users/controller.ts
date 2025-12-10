import { User, UserRole, PrismaClient } from "@prisma/client";
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

// We use 'any' here because the input JSON has dateOfBirth as a string
export async function createUser(data: any) {
  const newUser = await prisma.user.create({
    data: {
      id: data.id, // Explicitly set ID (from Clerk)
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.emailAddress,
      phoneNumber: data.phoneNumber,
      // FIX: Convert the string "YYYY-MM-DD" to a Date object
      dateOfBirth: new Date(data.dateOfBirth), 
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      // Handle the Role
      role: (data.role as UserRole) || 'VOLUNTEER', 
      // If you added 'languages' to your schema, uncomment this:
    },
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
