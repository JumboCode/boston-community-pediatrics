import EventAdminTableSkeleton from "@/components/ui/skeleton/EventAdminTableSkeleton";
import EventVolunteerTableSkeleton from "@/components/ui/skeleton/EventVolunteerTableSkeleton";
import Loading from "@/app/event/[id]/loading";


export default function TestPage() {
  
  return <EventVolunteerTableSkeleton />;
  //return <Loading />;
  //return <EventAdminTableSkeleton showWaitlist={false} />;
}