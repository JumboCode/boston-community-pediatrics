import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import { getUserById } from "@/app/api/users/controller";

export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return await getUserById(user.id);
});
 