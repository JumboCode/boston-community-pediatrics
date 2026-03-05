import EventAdminTableSkeleton from "@/components/ui/skeleton/EventAdminTableSkeleton";
import EventTableSkeleton from "@/components/ui/skeleton/EventTableSkeleton";
import Loading from "@/app/event/[id]/loading";


export default function TestPage() {
  
  return <EventTableSkeleton />;
  //return <Loading />;
  //return <EventAdminTableSkeleton showWaitlist={false} />;
}