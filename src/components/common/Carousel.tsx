'use client';

import Image, { StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';

type CarouselProps = {
  images: StaticImageData[];
};

export default function Carousel({ images }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const slideCount = Math.max(images.length, 1);
  const goTo = (i: number) => setIndex(i);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slideCount), 3000);
    return () => clearInterval(id);
  }, [slideCount]);

  return (
    <div className="w-[1000px]">
      {/* Image box */}
      <div className="relative h-[360px] overflow-hidden bg-white">
        {images.map((src, i) => (
          <div
            key={`${src.src}-${i}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === i ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
            aria-hidden={index !== i}
          >
            <Image src={src} alt={`Slide ${i + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Dots UNDER the picture, 24px gap */}
      <div className="mt-[24px] flex justify-center gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-[10px] w-[10px] rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7B8B97] ${
              index === i ? 'bg-[#7B8B97]' : 'bg-[#CBD3D8]'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={index === i}
          />
        ))}
      </div>
    </div>
  );
}