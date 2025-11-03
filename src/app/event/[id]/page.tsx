import Carousel from "@/components/common/Carousel"

export default function CarouselPage() {
  const event = {
    name: "JumboCode Event",
    date: "October 12-14, 2025",
    location: "123 ABC Street, Boston MA 12345",
    description: "Lorem ipsum dolor sit amet consectetur. Neque tellus bibendum etiam purus volutpat amet faucibus nibh nunc. Lacus quam pretium vitae dignissim. Nibh et tempus venenatis scelerisque enim egestas vestibulum tempor. Aliquam sit pretium tellus at molestie diam erat eget eget. Sagittis aliquam orci feugiat vitae. Sed a lectus porttitor mattis cursus viverra ut nisl mauris. Vitae faucibus ultrices volutpat fringilla in commodo. Massa augue malesuada consequat ac.",
    images: [
      "/images/event1.png",
      "/images/event2.png",
      "/images/event3.png",
    ],
  };

  return (
    <main className="flex flex-col items-center min-h-screen pt-16 pb-24">
      <Carousel images={event.images} />
      <div className="w-[1000px] mt-[56px]">
        <h1 className="text-[#234254] text-[36px] leading-[44px]">{event.name}</h1>
        <p className="text-[#234254] text-[24px] leading-[32px] mt-[8px]">
          {event.date}
        </p>
        <p className="text-[#234254] text-[16px] leading-[24px] mt-[8px]">
          {event.location}
        </p>
        <p className="text-[#234254] text-[16px] leading-[24px] mt-[32px]">
          {event.description}
        </p>
      </div>
    </main>
  );
}