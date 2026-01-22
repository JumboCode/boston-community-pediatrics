import EventForm from "@/components/common/forms/EventForm";
import { redirect } from 'next/navigation';
import { auth } from "@clerk/nextjs/server";
import { Protect } from "@clerk/nextjs";


export default function EventFormPage() {
    return (
        <main className="flex min-h-screen items-center justify-center">
            {/* auth.protect({ role: 'admin' }); */}
            <EventForm/>
        </main>
    );
}