import AdminVolunteerProfileView from "@/components/AdminVolunteerProfileView";

export default async function AdminVolunteerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminVolunteerProfileView targetUserId={id} />;
}
