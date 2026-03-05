
import Skeleton from "@/components/ui/skeleton/Skeleton";
import EventTableSkeleton from "@/components/ui/skeleton/EventTableSkeleton";

export default function Loading() {
  return (
   <div className="flex flex-col justify-center items-center">
      <div className="pt-16 pb-12 flex flex-col items-center">

        {/* Carousel */}
        <Skeleton className="w-[996px] h-[360px]" />

        {/* Dots */}
        <div className="flex gap-[16px] mt-[24px]">
          <Skeleton className="w-[10px] h-[10px] rounded-full" />
          <Skeleton className="w-[10px] h-[10px] rounded-full" />
          <Skeleton className="w-[10px] h-[10px] rounded-full" />
          <Skeleton className="w-[10px] h-[10px] rounded-full" />
        </div>
      </div>

      {/* Table */}
      <EventTableSkeleton />
    </div>
  );
}
