import { UserRole, PrismaClient } from "@prisma/client";

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
      id: data.id, 
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.emailAddress,
      phoneNumber: data.phoneNumber,
      dateOfBirth: new Date(data.dateOfBirth),
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      role: (data.role as UserRole) || "VOLUNTEER",
    },
  });
  return newUser;
}

export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    dateOfBirth?: Date;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserProfileImage(
  userId: string,
  imageKey: string | null
) {
  return prisma.user.update({
    where: { id: userId },
    data: { profileImage: imageKey },
  });
}

export async function adminUpdateUserRole(userId: string, role: UserRole) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function deleteUser(id: string) {
  const deletedUser = await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return deletedUser;
}