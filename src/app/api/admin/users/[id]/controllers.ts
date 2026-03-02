import { PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function deleteUser(id: string) {
  try {
    // Delete from DB first
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    // Only delete from Clerk if DB succeeded
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(id);
    } catch (clerkError) {
      // Log it but don't fail the request — DB is source of truth
      console.error("DB deleted but Clerk delete failed:", clerkError);
    }

    return deletedUser;
  } catch (dbError) {
    console.error("DB delete failed:", dbError);
    throw dbError;
  }
}
