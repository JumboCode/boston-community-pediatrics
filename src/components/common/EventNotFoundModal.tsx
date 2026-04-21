"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/common/Modal";
import Image from "next/image";
import arrowLeft from "@/assets/icons/arrow-left.svg";

export default function EventNotFoundModal() {
  const router = useRouter();

  const handleReturn = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      {/* Modal Container */}
      <div className="bg-white w-[792px] rounded-lg border border-black p-8 shadow-xl flex flex-col items-center text-center relative">
        {/* Top-left back arrow */}
        <button
          onClick={handleReturn}
          className="absolute top-4 left-4 opacity-60 hover:opacity-100 transition"
        >
          <Image src={arrowLeft} alt="Go back" className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-4xl mb-6">Event not found.</h2>

        {/* Return Button */}
        <button
          onClick={handleReturn}
          className="mt-4 px-6 py-2 rounded-md border border-black bg-[#234254] text-white hover:bg-[#1b3443] transition"
        >
          Return
        </button>
      </div>
    </div>
  );
}
