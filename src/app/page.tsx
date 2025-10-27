"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      <h1 className="text-5xl font-extrabold mb-4">Welcome to BCP!</h1>
      <button
        onClick={() => router.push("/login")}
        className="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all"
      >
        Get Started
      </button>
    </div>
  );
}
