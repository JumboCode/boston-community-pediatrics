
import Skeleton from "@/components/ui/skeleton/Skeleton";
import EventAdminTableSkeleton from "@/components/ui/skeleton/EventAdminTableSkeleton";
import EventTableSkeleton from "@/components/ui/skeleton/EventTableSkeleton";

export default function Loading() {
  return (
   <div className="flex flex-col justify-center items-center">
      <div className="pt-16 pb-12 flex flex-col items-center">

        {/* Carousel */}
        <Skeleton className="w-[650px] h-[220px]" />

        {/* Dots */}
        <div className="flex gap-2 mt-3">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>
      </div>

      {/* Table */}
      <EventTableSkeleton />
    </div>
  );
}
