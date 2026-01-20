"use client";
import Image from "next/image";
import BackArrow from "@/assets/icons/arrow-left.svg";
import EventCard from "@/components/events/EventCard";
import { useUser } from "@clerk/nextjs";
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, isSignedIn, isLoaded } = useUser();
    // DEBUG: inspect the shape returned by Clerk
    useEffect(() => {
      console.log("Clerk user object:", user);
    }, [user]);
    if (!isLoaded) {
        return <main className="min-h-screen p-8" />;
    }
    const firstName = isSignedIn ? user?.firstName ?? "" : "Guest";
    const lastName = isSignedIn ? user?.lastName ?? "" : "";
    const emailAddress = isSignedIn ? user?.primaryEmailAddress?.emailAddress ?? "—" : "—";
    const phoneNumber = isSignedIn ? user?.primaryPhoneNumber?.phoneNumber ?? "—" : "—";
    const memberSince = isSignedIn && user?.createdAt ? new Date(user.createdAt).getFullYear() : "0000";

    return (
        <main className="min-h-screen p-8">
            <div className="mt-[142px] ml-[120px] flex items-center gap-3">
                <div className="text-[28px] font-bold w-[283px] h-[36.19]">
                    UPCOMING EVENTS
                </div>
                <Image
                    src={BackArrow}
                    alt=""
                    className="h-[36.19px] w-[31.75px] rotate-180 ml-[69.25px] hover:bg-gray-100 rounded-lg"
                />
            </div>
            <div className="mt-[54px] ml-[120px] flex gap-[25px]">
                {/* we need to find a way to use eventcard to load the events with the backend info i think */}
            </div>
            <div className="absolute top-[248px] right-[121px] w-[305px] h-[420px] bg-[#426982] rounded-lg">
            
                <div className="absolute top-[30px] left-1/2 transform -translate-x-1/2 w-[105px] h-[105px] bg-[#D9D9D9] rounded-full">
                </div>
                <div className = "flex flex-col items-center mt-40 space-y-.25">
                    <div className = "text-white font-bold text-[24px]">{firstName} {lastName}</div>
                    <div className = "text-white text-[16px]">Member since {memberSince}</div>
                    
                </div>
                <div className = "flex flex-col mt-6 space-y-2">
                    <div className = "flex justify-between">
                        <div className = "text-white ml-[25px] text-[16px]">Phone number</div>
                        <div className = "text-white mr-[25px] text-[16px]">{phoneNumber}</div>
                    </div>
                    <div className = "flex justify-between">
                        <div className = "text-white ml-[25px] text-[16px]">Email</div>
                        <div className = "text-white mr-[25px] text-[16px]">{emailAddress}</div>
                    </div>
                </div>
                

                <button className="mt-[30.82px] ml-[99.62px] w-[113px] h-[44px] text-black bg-[#ffffff] rounded-lg hover:bg-gray-300 border-[1px]" >
                    <div className="text-[16px]">Edit details</div>
                </button>

            </div>
            <div className="mt-[142px] ml-[120px] flex items-center gap-3">
                <div className="text-[28px] font-bold w-[283px] h-[36.19]">
                    PAST EVENTS
                </div>
                <Image
                    src={BackArrow}
                    alt=""
                    className="h-[36.19px] w-[31.75px] rotate-180 ml-[69.25px] hover:bg-gray-100 rounded-lg"
                />
            </div>

        </main>
        
    );
}/* event 1 and 2 manual blocks
                <div className="w-[282px]">
                    <div className="h-[168px] w-[282px] bg-[#D9D9D9]" />
                    <div className="mt-[12px] flex items-center justify-between">
                        <div className="text-[20px] font-bold">Event 1</div>
                    </div>
                </div>
                <div className="w-[282px]">
                    <div className="h-[168px] w-[282px] bg-[#D9D9D9]" />
                    <div className="mt-[12px] flex items-center justify-between">
                        <div className="text-[20px] font-bold">Event 2</div>
                    </div>
                </div>
*/