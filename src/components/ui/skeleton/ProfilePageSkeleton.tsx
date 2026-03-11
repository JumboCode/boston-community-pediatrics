import Skeleton from "@/components/ui/skeleton/Skeleton";

function ProfilePageSkeleton() {
  return (
    <div className="relative w-full pb-[1057px] pt-[60px] min-h-screen bg-[var(--color-white)]">
      <div className="absolute left-[120px] top-[214px] rounded-lg overflow-hidden border border-[var(--color-gray-border)] w-[283px] h-[318px] bg-[var(--color-white)]">
        <Skeleton className="w-full h-[150px] rounded-none" />
        <div className="h-[120px] bg-[var(--color-white)]" />
      </div>

      <div className="absolute left-[426px] top-[214px] rounded-lg overflow-hidden border border-[var(--color-gray-border)] w-[283px] h-[318px] bg-[var(--color-white)]">
        <Skeleton className="w-full h-[150px] rounded-none" />
        <div className="h-[120px] bg-[var(--color-white)]" />
      </div>

      <div className="absolute left-[117px] top-[640px] w-[581px] h-[299px] rounded-lg border border-[var(--color-gray-border)] bg-[var(--color-white)] overflow-hidden">
        <div className="absolute left-0 right-0 top-[47px] h-px bg-[var(--color-gray-border)]" />
      </div>

      <div className="absolute right-[121px] top-[148px] w-[305px] h-[420px] rounded-xl bg-[var(--color-light-bcp-blue)]">
        <Skeleton className="absolute top-[37px] left-1/2 -translate-x-1/2 h-[105.76px] w-[105.76px] rounded-full" />

        <div className="absolute bottom-[40px] left-[40px] h-[40px] w-[120px] rounded-md bg-[var(--color-white)]" />
        <div className="absolute bottom-[40px] right-[40px] h-[40px] w-[90px] rounded-md bg-[var(--color-bcp-blue)]" />
      </div>
    </div>
  );
}

export default ProfilePageSkeleton;