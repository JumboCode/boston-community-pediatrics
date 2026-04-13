function EventTableSkeleton() {
  return (
    <div className="w-full flex justify-center">
      {/* Outer box */}
      <div className="w-[996px] h-[931px] border border-[var(--color-medium-gray)] bg-white grid grid-rows-3 mb-[110px] mt-[384px]">

        {/* Row 1 */}
        <div className="grid border-b border-[var(--color-gray-border)]">
          <div className="relative p-8">
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid border-b border-[var(--color-gray-border)]">
          <div className="relative p-8">
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid">
          <div className="relative p-8">
          </div>
        </div>

      </div>
    </div>
  );
}

export default EventTableSkeleton;