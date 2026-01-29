import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  if (!user || user.publicMetadata.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
