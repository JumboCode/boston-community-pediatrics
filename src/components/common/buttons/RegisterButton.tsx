"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/buttons/Button";

interface RegisterButtonProps {
  positionId: string;
  disabled: boolean;
}

export default function RegisterButton({
  positionId,
  disabled,
}: RegisterButtonProps) {
  const router = useRouter();

  return (
    <Button
      label="Register"
      disabled={disabled}
      onClick={() => router.push(`/register/${positionId}`)}
      altStyle="w-[94px] h-[40px] mt-[12px] text-white bg-light-bcp-blue rounded font-medium flex items-center justify-center hover:bg-light-bcp-blue"
    />
  );
}
