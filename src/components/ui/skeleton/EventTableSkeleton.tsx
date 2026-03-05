import Skeleton from "@/components/ui/skeleton/Skeleton";
import Image from "next/image";
import blankProfile from "@/assets/icons/Group 1.svg";

function EventTableSkeleton() {
  return (
    <div className="w-full flex justify-center">
      {/* Outer box */}
      <div className="w-[996px] h-[931px] border border-gray-300 bg-white grid grid-rows-3 mb-[110px] mt-[384px]">

        {/* Row 1 */}
        <div className="grid grid-cols-[1fr_160px] border-b border-gray-200">
          <div className="relative p-8">
            <Skeleton className="absolute bottom-8 left-8 h-10 w-24 rounded-md" />
          </div>

          <div className="border-l border-gray-200 flex items-center justify-end pr-6">
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <Image
                  key={i}
                  src={blankProfile}
                  alt="profile placeholder"
                  width={33}
                  height={33}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-[1fr_160px] border-b border-gray-200">
          <div className="relative p-8">
            <Skeleton className="absolute bottom-8 left-8 h-10 w-24 rounded-md" />
          </div>

          <div className="border-l border-gray-200 flex items-center justify-end pr-6">
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <Image
                  key={i}
                  src={blankProfile}
                  alt="profile placeholder"
                  width={33}
                  height={33}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-[1fr_160px]">
          <div className="relative p-8">
            <Skeleton className="absolute bottom-8 left-8 h-10 w-24 rounded-md" />
          </div>

          <div className="border-l border-gray-200 flex items-center justify-end pr-6">
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <Image
                  key={i}
                  src={blankProfile}
                  alt="profile placeholder"
                  width={33}
                  height={33}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EventTableSkeleton;