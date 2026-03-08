import Skeleton from "@/components/ui/skeleton/Skeleton";


function MessagingSkeleton(){
    return(
        <main className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col gap-[24px]">
        
        {/* Send to */}
        <div className="flex flex-row items-center justify-between w-[714px]">
          <Skeleton className="h-4 w-16" />
          <div className="w-[588px] h-[44px] rounded-lg border border-gray-200" />
        </div>

        {/* Subject */}
        <div className="flex flex-row items-center justify-between w-[714px]">
          <Skeleton className="h-4 w-16" />
          <div className="w-[588px] h-[44px] rounded-lg border border-gray-200" />
        </div>

        {/* Message */}
        <div className="flex flex-row items-start justify-between w-[714px]">
          <Skeleton className="h-4 w-16" />
          <div className="w-[588px] h-[204px] rounded-lg border border-gray-200" />
        </div>

        {/* Buttons */}
        <div className="flex flex-row justify-between pt-[20px] w-[714px]">
            <div className="ml-[126px]">
          <Skeleton className="w-[183px] h-[44px] rounded-lg" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-[150px] h-[44px] rounded-lg" />
            <Skeleton className="w-[120px] h-[44px] rounded-lg" />
          </div>
        </div>

      </div>
    </main>
    );
}

export default MessagingSkeleton;