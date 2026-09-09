import { Head } from '@inertiajs/react';
import ChatBox, { type GenericChatMessage } from '@/components/chat-box';
import Heading from '@/components/heading';
import type { BreadcrumbItem } from '@/types';

type PoojaBookingInfo = {
    id: number;
    pooja_name: string;
    scheduled_date: string;
    status: string;
    is_chat_active: boolean;
};

type Props = {
    booking: PoojaBookingInfo;
    chatUrl: string;
    messages: GenericChatMessage[];
    currentUserId: number;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Support chat', href: '#' }];

export default function PoojaChatShow({
    booking,
    chatUrl,
    messages,
    currentUserId,
}: Props) {
    return (
        <>
            <Head title={`Support chat — ${booking.pooja_name}`} />
            <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col gap-4 rounded-xl p-4">
                <Heading
                    title={`Support chat — ${booking.pooja_name}`}
                    description={`${booking.scheduled_date} · ${booking.status}`}
                />
                <ChatBox
                    channel={`pooja-booking.${booking.id}`}
                    postUrl={chatUrl}
                    messages={messages}
                    currentUserId={currentUserId}
                    isActive={booking.is_chat_active}
                    activeHint="Support chat is open for confirmed pooja bookings."
                    inactiveHint="Support chat opens once your pooja booking is confirmed."
                />
            </div>
        </>
    );
}

PoojaChatShow.layout = { breadcrumbs };
