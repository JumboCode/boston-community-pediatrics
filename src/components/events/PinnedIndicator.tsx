import Image from "next/image";

export default function PinnedIndicator() {
  return (
    <div className="absolute top-[-8] right-[-8] z-40">
      <Image
        src="/pinIcon.png"
        alt="Pinned event"
        width={26}
        height={26}
        className="drop-shadow-md"
      />
    </div>
  );
}
