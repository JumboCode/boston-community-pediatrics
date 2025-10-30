'use client'

import Image from "next/image";
import { useEffect, useState } from "react";

interface ComponentProps {
    prop1?: any;
    prop2?: any;
  }

/*const images = [
  "/assets/images/image1.jpg",
  "/assets/images/image2.jpg",
  "/assets/images/image3.jpg",
  "/assets/images/image4.jpg",
  "/assets/images/image5.jpg",
];*/

const Carousel = () => {
  const [index, setIndex] = useState(0);
  //const slideCount = images.length;

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % 5);
    }, 5000); // auto-advance every 5s
    return () => clearInterval(id);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + 5) % 5);
  const next = () => setIndex((i) => (i + 1) % 5);
  const goTo = (i: number) => setIndex(i);

  return (

    <div id="default-carousel" className="relative w-full" data-carousel="slide">
        {/*<!-- Carousel wrapper -->*/}
        
        <div className="relative w-full h-56 md:h-96">
            {/*<!-- Item 1 -->*/}
            <div className="duration-700 ease-in-out" data-carousel-item>
                <Image src="/assets/images/image1.jpg" fill className="object-cover" alt="..." />
            </div>
            {/*<!-- Item 2 -->*/}
            
            <div className="duration-700 ease-in-out" data-carousel-item>
                <Image src="/assets/images/image2.jpg" fill className="w-[1000px] h-[360px] center" alt="Slide 3" />
            </div>
  
            {/*<!-- Item 3 -->*/}
            <div className="duration-700 ease-in-out" data-carousel-item>
                <Image src="/assets/images/image3.jpg" fill className="w-[1000px] h-[360px] center" alt="Slide 3" />
            </div>
            {/*<!-- Item 4 -->*/}
            <div className="duration-700 ease-in-out" data-carousel-item>
                <Image src="/assets/images/image4.jpg" fill className="w-[1000px] h-[360px] center" alt="Slide 4" />
            </div>
            {/*<!-- Item 5 -->*/}
            <div className="duration-700 ease-in-out" data-carousel-item>
                <Image src="/assets/images/image5.jpg" fill className="w-[1000px] h-[360px] center" alt="Slide 5" />
            </div>
        </div>
        {/*-- Slider indicators --*/}
        <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
            <button type="button" className="w-3 h-3 rounded-full" aria-current="true" aria-label="Slide 1" data-carousel-slide-to="0"></button>
            <button type="button" className="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 2" data-carousel-slide-to="1"></button>
            <button type="button" className="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 3" data-carousel-slide-to="2"></button>
            <button type="button" className="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 4" data-carousel-slide-to="3"></button>
            <button type="button" className="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 5" data-carousel-slide-to="4"></button>
        </div>
        {/*-- Slider controls -->
        <button type="button" className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-prev>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
                </svg>
                <span className="sr-only">Previous</span>
            </span>
        </button>
        <button type="button" className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="sr-only">Next</span>
            </span>
        </button> */}
    </div>

  );
};

export default Carousel;
  



  /**
   * Use JSDoc styling right above the header if this component is important.
   * z`
   * Also, the name of the component should capitalized, and the file should be the same.
   * */
  