"use client";

import EditableImage from "@/components/admin-editable/EditableImage";

export default function EventHero() {
  return (
    <div className="w-full overflow-hidden">
      <EditableImage
        contentKey="event.hero"
        fallbackSrc="/high-res-stock-photo.jpg"
        alt="Event Image"
        width={1920}
        height={600}
        className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
        wrapperClassName="w-full block"
        pencilClassName="absolute bottom-4 right-4 z-10"
      />
    </div>
  );
}
