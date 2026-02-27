import { UserRole, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function adminUpdateUserRole(
  userId: string,
  newRole: UserRole
) {
  return prisma.user.update({
    where: { id: userId },
    data: { role:newRole },
  });
}
