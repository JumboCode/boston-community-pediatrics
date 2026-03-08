import Skeleton from "@/components/ui/skeleton/Skeleton";
import EventsSkeleton from "@/components/ui/skeleton/EventsSkeleton";

export default function Loading() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero */}
      <Skeleton className="w-full h-96" />

      <div className="w-full max-w-[1200px] px-6 py-12">
        <div className="mb-12">
          <EventsSkeleton />
        </div>
        <EventsSkeleton />
      </div>
    </div>
  );
}
