import Image from "next/image";
import BackArrow from "@/assets/icons/arrow-left.svg";
import EventCard from "@/components/events/EventCard";

export default function ProfilePage() {
    
    <EventCard
        id="test-event"
        title="Test Event"
        image="/event1.jpg"   // must exist in /public
        time={new Date()}
        location="Test Location"
        date={new Date()}
    />

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
                <div className="w-[282px]">
                    <div className="h-[168px] w-[282px] bg-[#D9D9D9]" />
                    <div className="mt-[12px] flex items-center justify-between">
                        <div className="text-[20px] font-bold">Event 1</div>
                        <button
                            type="button"
                            className="rounded p-1 hover:bg-gray-100"
                        >
                            <span className="text-3xl leading-none">⋮</span>
                        </button>
                    </div>
                </div>
                <div className="w-[282px]">
                    <div className="h-[168px] w-[282px] bg-[#D9D9D9]" />
                    <div className="mt-[12px] flex items-center justify-between">
                        <div className="text-[20px] font-bold">Event 2</div>
                        <button
                            type="button"
                            className="rounded p-1 hover:bg-gray-100"
                        >
                            <span className="text-3xl leading-none">⋮</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="absolute top-[248px] right-[121px] w-[305px] h-[420px] bg-[#426982] rounded-lg">
            
                <div className="absolute top-[30px] left-1/2 transform -translate-x-1/2 w-[105px] h-[105px] bg-[#D9D9D9] rounded-full">
                </div>
                <div className = "flex flex-col items-center mt-40 space-y-.25">
                    <div className = "text-white font-bold text-[24px]">NAME</div>
                    <div className = "text-white text-[16px]">Member since 0000</div>
                    
                </div>
                <div className = "flex flex-col mt-6 space-y-2">
                    <div className = "flex justify-between">
                        <div className = "text-white ml-[25px] text-[16px]">Phone number</div>
                        <div className = "text-white mr-[25px] text-[16px]">123 456 7890</div>
                    </div>
                    <div className = "flex justify-between">
                        <div className = "text-white ml-[25px] text-[16px]">Email</div>
                        <div className = "text-white mr-[25px] text-[16px]">...@gmail.com</div>
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
}