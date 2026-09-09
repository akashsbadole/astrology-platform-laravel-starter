import { Head } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Send } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCsrfTokenFromCookie } from '@/lib/csrf';
import type { BreadcrumbItem } from '@/types';

type ChatMessage = {
    id: number;
    booking_id: number;
    sender_id: number;
    sender_name: string;
    body: string;
    created_at: string;
};

type BookingInfo = {
    id: number;
    status: string;
    scheduled_at: string;
    duration_minutes: number;
    ends_at: string;
    is_session_active: boolean;
    other_party_name: string;
};

type Props = {
    booking: BookingInfo;
    messages: ChatMessage[];
    currentUserId: number;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chat', href: '#' }];

export default function ChatShow({
    booking,
    messages: initialMessages,
    currentUserId,
}: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEcho<ChatMessage>(
        `booking.${booking.id}`,
        'MessageSent',
        (payload) => {
            setMessages((current) => [...current, payload]);
        },
        [booking.id],
    );

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (event: FormEvent) => {
        event.preventDefault();

        if (!body.trim() || sending) {
            return;
        }

        setSending(true);

        try {
            const response = await fetch(`/bookings/${booking.id}/chat`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
                },
                body: JSON.stringify({ body }),
            });

            if (response.ok) {
                const message: ChatMessage = await response.json();
                setMessages((current) => [...current, message]);
                setBody('');
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Head title={`Chat with ${booking.other_party_name}`} />
            <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col gap-4 rounded-xl p-4">
                <Heading
                    title={`Chat with ${booking.other_party_name}`}
                    description={
                        booking.is_session_active
                            ? `Session active until ${new Date(booking.ends_at).toLocaleTimeString()}`
                            : 'This session is not currently active'
                    }
                />

                <Card className="flex flex-1 flex-col overflow-hidden">
                    <CardContent className="flex-1 space-y-3 overflow-y-auto py-4">
                        {messages.length === 0 && (
                            <p className="text-muted-foreground py-10 text-center text-sm">
                                No messages yet. Say hello!
                            </p>
                        )}
                        {messages.map((message) => {
                            const isMine = message.sender_id === currentUserId;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                                            isMine
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <p>{message.body}</p>
                                        <p
                                            className={`mt-1 text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                                        >
                                            {new Date(
                                                message.created_at,
                                            ).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </CardContent>
                </Card>

                {booking.is_session_active ? (
                    <form onSubmit={send} className="flex gap-2">
                        <input
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            placeholder="Type a message..."
                            className="border-input bg-background h-10 flex-1 rounded-md border px-3 text-sm"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={sending || !body.trim()}
                        >
                            <Send className="size-4" />
                        </Button>
                    </form>
                ) : (
                    <p className="text-muted-foreground text-center text-sm">
                        Messaging opens automatically when your scheduled
                        session begins.
                    </p>
                )}
            </div>
        </>
    );
}

ChatShow.layout = { breadcrumbs };
