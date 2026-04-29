import Skeleton from "@/components/ui/skeleton/Skeleton";

function RegisterSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 w-full max-w-2xl mx-auto">
        {/* Event name + position */}
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-5 w-40 rounded-md" />
        </div>

        {/* Your information label */}
        <Skeleton className="h-4 w-32 rounded mb-2" />

        {/* User info card */}
        <div className="border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <Skeleton className="w-24 h-24 rounded-sm flex-shrink-0" />
            <div className="flex flex-col gap-2 pt-1 flex-1">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-4 w-56 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
          </div>
        </div>

        {/* Additional comments */}
        <div className="mb-8">
          <Skeleton className="h-4 w-40 rounded mb-2" />
          <Skeleton className="w-full h-[100px] rounded-lg" />
        </div>

        {/* Signing up for text */}
        <Skeleton className="h-4 w-72 rounded mb-10" />

        {/* Add a Guest button */}
        <Skeleton className="w-full h-12 rounded mb-8" />

        {/* Cancel + Sign Up buttons */}
        <div className="flex items-center gap-4">
          <Skeleton className="flex-1 h-12 rounded" />
          <Skeleton className="flex-1 h-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export default RegisterSkeleton;
