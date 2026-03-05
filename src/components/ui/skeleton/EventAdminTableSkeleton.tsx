import Skeleton from "@/components/ui/skeleton/Skeleton";

interface EventAdminTableSkeletonProps{
    showWaitlist: boolean;
}


function EventAdminTableSkeleton(props: EventAdminTableSkeletonProps) {
  const { showWaitlist } = props;

  return (
    <div className="min-w-[1100px] flex items-center justify-center p-6">
        <div className="w-full max-w-[996px] border border-gray-300">
            {/*header*/}
            <div className="h-[400px]">
                </div>
            
            {/*grey bottom*/}
            <Skeleton className="h-[60px] w-full rounded-none"/>

            {/* Waitlist section */}
            {showWaitlist && (
          <>
            <div className="h-[400px]" />
            <Skeleton className="h-[60px] w-full rounded-none" />
          </>
        )}

            </div>
        </div>
    );
}

export default EventAdminTableSkeleton;