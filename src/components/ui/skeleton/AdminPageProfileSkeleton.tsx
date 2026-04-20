import Skeleton from "@/components/ui/skeleton/Skeleton";

export default function AdminProfilePageSkeleton() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-white)]">
      <div className="w-[850px] max-w-full rounded-md bg-[var(--color-light-bcp-blue)] py-16 px-10 shadow-lg flex flex-col items-center">
        {/* Profile Image Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
        </div>

        {/* Name and Member Since Skeleton */}
        <div className="text-center mb-10 w-full max-w-[760px] flex flex-col items-center gap-3">
          <Skeleton className="h-[38px] w-[300px] rounded-md" />
          <Skeleton className="h-[24px] w-[200px] rounded-md" />
        </div>

        {/* Phone and Email Skeleton */}
        <div className="w-full max-w-[600px] flex flex-col gap-6 mb-12">
          <div className="flex justify-between items-center">
            <div className="text-white text-[18px]">Phone number</div>
            <Skeleton className="h-[24px] w-[150px] rounded-md" />
          </div>
          <div className="flex justify-between items-center">
            <div className="text-white text-[18px]">Email</div>
            <Skeleton className="h-[24px] w-[250px] rounded-md" />
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex justify-center gap-6">
          <Skeleton className="h-[48px] w-[140px] rounded-md bg-white/50" />
          <Skeleton className="h-[48px] w-[140px] rounded-md bg-slate-700/50" />
        </div>
      </div>
    </main>
  );
}