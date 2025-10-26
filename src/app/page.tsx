"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      {/* Your same UI, then replace button: */}
      <button
        onClick={() => router.push("/login")}
        className="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all"
      >
        Get Started
      </button>
    </div>
  );
}
