"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/buttons/Button";

interface RegisterButtonProps {
  positionId: string;
}

export default function RegisterButton({ positionId }: RegisterButtonProps) {
  const router = useRouter();

  return (
    <Button
      label="Register"
      onClick={() => router.push(`/register/${positionId}`)}
      altStyle="w-[94px] h-[40px] mt-[12px] text-white bg-[#426982] rounded font-medium flex items-center justify-center hover:bg-[#426982]"
    />
  );
}
