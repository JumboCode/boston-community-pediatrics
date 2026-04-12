"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/buttons/Button";

interface RegisterButtonProps {
  positionId: string;
  disabled: boolean;
  isFull: boolean;
}

export default function RegisterButton({
  positionId,
  disabled,
  isFull,
}: RegisterButtonProps) {
  const router = useRouter();

  return (
    <Button
      label={isFull ? "Join Waitlist" : "Register"}
      disabled={disabled}
      onClick={() => router.push(`/register/${positionId}`)}
      altStyle={`mt-[12px] rounded font-medium flex items-center justify-center h-[40px] ${
        isFull
          ? "w-[120px] bg-gray-300 text-black hover:bg-gray-400"
          : "w-[94px] bg-light-bcp-blue text-white hover:bg-light-bcp-blue"
      }`}
    />
  );
}
