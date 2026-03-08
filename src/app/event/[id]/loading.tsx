import Skeleton from "@/components/ui/skeleton/Skeleton";
import EventTableSkeleton from "@/components/ui/skeleton/EventTableSkeleton";
import BackArrow from "@/assets/icons/arrow-left.svg";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="relative flex flex-col justify-center items-center">
      
      {/* Back Arrow */}
      <Image
        src={BackArrow}
        alt="Back"
        className="absolute top-[49px] left-[64px]"
      />

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