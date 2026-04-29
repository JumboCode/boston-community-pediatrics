import Skeleton from "@/components/ui/skeleton/Skeleton";

function EditProfileSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <main className="flex-grow flex justify-center items-start py-16 px-4">
        <div className="bg-white w-full max-w-[700px] border rounded-md shadow-sm p-10">
          {/* Back arrow */}
          <Skeleton className="h-8 w-8 rounded mb-6" />

          {/* Title */}
          <Skeleton className="h-7 w-48 rounded mx-auto mb-10" />

          <div className="space-y-6">
            {/* First / Last Name */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-4 w-20 rounded mb-1" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 rounded mb-1" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>

            {/* Email */}
            <div>
              <Skeleton className="h-4 w-12 rounded mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {/* Phone */}
            <div>
              <Skeleton className="h-4 w-28 rounded mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {/* DOB */}
            <div>
              <Skeleton className="h-4 w-24 rounded mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {/* Spanish */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-40 rounded" />
              <div className="flex gap-6">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <Skeleton className="h-4 w-36 rounded mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {/* City */}
            <div>
              <Skeleton className="h-4 w-20 rounded mb-1" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            {/* State / Zip */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-4 w-20 rounded mb-1" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 rounded mb-1" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>

            {/* Photo upload */}
            <div className="flex gap-6 mt-6 items-center">
              <Skeleton className="w-[160px] h-[160px] rounded flex-shrink-0" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-9 w-28 rounded" />
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-center pt-8">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditProfileSkeleton;
