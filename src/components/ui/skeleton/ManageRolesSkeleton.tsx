import Skeleton from "@/components/ui/skeleton/Skeleton";

function ManageRolesSkeleton() {
  return (
    <div className="items-center justify-center p-6 ml-60 mr-60">
      
      <Skeleton className="h-4 w-32 mb-6" />

      {/* the table */}
      <div className="border border-black h-[550px]" />

      {/* buttonsss */}
      <div className="flex justify-between py-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export default ManageRolesSkeleton;