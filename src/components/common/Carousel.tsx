'use client'

import Image from "next/image";
import image6 from '@/assets/images/image6.jpg';
import image5 from '@/assets/images/image5.jpg';
import image4 from '@/assets/images/image4.jpg';
import image3 from '@/assets/images/image3.jpg';
import image2 from '@/assets/images/image2.jpg';
import image1 from '@/assets/images/image1.jpg';
import { useEffect, useState } from "react";

type CarouselProps = {
    images: string[];
};

export default function Carousel({ images }: CarouselProps) {
    const [index, setIndex] = useState(0);
    const slideCount = 6;
    const goTo = (i: number) => setIndex(i);

    useEffect(() => {
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % slideCount);
        }, 3000); // auto-advance
        return () => clearInterval(id);
    }, [slideCount]);

    return (
    <div className="flex flex-col items-center mt-[64px]">
        <div className="relative w-[1000px] h-[360px] overflow-hidden bg-white">
        {/* Slide 1 */}
            <div
                data-carousel-item
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 0 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
                aria-hidden={index !== 0}
            >
                <div className="relative w-full h-[360px]">
                    <Image src={image1} alt="Slide 1" fill className="object-cover" />
                </div>
            </div>

        {/* Slide 2 */}
            <div
                data-carousel-item
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 1 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
                aria-hidden={index !== 1}
            >
                <div className="relative w-full h-[360px]">
                    <Image src={image2} alt="Slide 2" fill className="object-cover" />
                </div>
            </div>

        {/* Slide 3 */}
            <div
                data-carousel-item
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 2 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
                aria-hidden={index !== 2}
            >
                <div className="relative w-full h-[360px]">
                    <Image src={image3} alt="Slide 3" fill className="object-cover" />
                </div>
            </div>

        {/* Slide 4 */}
            <div
                data-carousel-item
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 3 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
                aria-hidden={index !== 3}
            >
                <div className="relative w-full h-[360px]">
                    <Image src={image4} alt="Slide 4" fill className="object-cover" />
                </div>
            </div>

        {/* Slide 5 */}
            <div
                data-carousel-item
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 4 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
                aria-hidden={index !== 4}
            >
                <div className="relative w-full h-[360px] flex-shrink-0 relative">
                    <Image src={image5} alt="Slide 5" fill className="object-cover" />
                </div>
            </div>

        {/* Slide 6 */}
            <div
                data-carousel-item
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 5 ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"}`}
                aria-hidden={index !== 5}
            >
                <div className="relative w-full h-[360px] flex-shrink-0 relative">
                    <Image src={image6} alt="Slide 6" fill className="object-cover" />
                </div>
            </div>
        </div>


        {/*indicators */}
        <div className="flex justify-center gap-3 mt-[24px]"> 
        
            <button 
                className={`w-3 h-3 rounded-full ${index === 0 ? "bg-[#D9D9D9]" : "bg-[#686868]"}
                hover:bg-white/50
                active:bg-white
                transition-colors duration-200
                `}
                aria-current={index === 0}
                aria-label="Slide 1"
                onClick={() => setIndex(0)}
        />
        <button 
                className={`w-3 h-3 rounded-full ${index === 1 ? "bg-[#D9D9D9]" : "bg-[#686868]"}
                hover:bg-white/50
                active:bg-white
                transition-colors duration-200
                `}
                aria-current={index === 1}
                aria-label="Slide 1"
                onClick={() => setIndex(1)}
        />
        <button 
                className={`w-3 h-3 rounded-full ${index === 2 ? "bg-[#D9D9D9]" : "bg-[#686868]"}
                hover:bg-white/50
                active:bg-white
                transition-colors duration-200
                `}
                aria-current={index === 2}
                aria-label="Slide 1"
                onClick={() => setIndex(2)}
        />
        <button 
                className={`w-3 h-3 rounded-full ${index === 3 ? "bg-[#D9D9D9]" : "bg-[#686868]"}
                hover:bg-white/50
                active:bg-white
                transition-colors duration-200
                `}
                aria-current={index === 3}
                aria-label="Slide 1"
                onClick={() => setIndex(3)}
        />
        <button 
                className={`w-3 h-3 rounded-full ${index === 4 ? "bg-[#D9D9D9]" : "bg-[#686868]"}
                hover:bg-white/50
                active:bg-white
                transition-colors duration-200
                `}
                aria-current={index === 4}
                aria-label="Slide 1"
                onClick={() => setIndex(4)}
        />
        <button 
                className={`w-3 h-3 rounded-full ${index === 5 ? "bg-[#D9D9D9]" : "bg-[#686868]"}
                hover:bg-white/50
                active:bg-white
                transition-colors duration-200
                `}
                aria-current={index === 5}
                aria-label="Slide 1"
                onClick={() => setIndex(5)}
        />
        </div>
    

    </div>

    );

};