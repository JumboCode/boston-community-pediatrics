import Skeleton from "@/components/ui/skeleton/Skeleton";

function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-[135px]">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden border border-gray-200 w-[283px] h-[318px]">
          <Skeleton className="w-full h-[150px] rounded-none" />
          <div className="h-[120px] bg-white" />
        </div>
      ))}
    </div>
  );
}

export default EventsSkeleton;