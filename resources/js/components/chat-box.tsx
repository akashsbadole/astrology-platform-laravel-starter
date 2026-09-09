import { useEcho } from '@laravel/echo-react';
import { Send } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCsrfTokenFromCookie } from '@/lib/csrf';

export type GenericChatMessage = {
    id: number;
    sender_id: number;
    sender_name: string;
    body: string;
    created_at: string;
    booking_id?: number;
    pooja_booking_id?: number;
};

type Props = {
    channel: string;
    postUrl: string;
    messages: GenericChatMessage[];
    currentUserId: number;
    isActive: boolean;
    inactiveHint: string;
    activeHint: string;
};

export default function ChatBox({
    channel,
    postUrl,
    messages: initialMessages,
    currentUserId,
    isActive,
    inactiveHint,
    activeHint,
}: Props) {
    const [messages, setMessages] =
        useState<GenericChatMessage[]>(initialMessages);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEcho<GenericChatMessage>(channel, 'MessageSent', (payload) => {
        setMessages((current) => [...current, payload]);
    });

    useEcho<GenericChatMessage>(channel, 'PoojaMessageSent', (payload) => {
        setMessages((current) => [...current, payload]);
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (event: FormEvent) => {
        event.preventDefault();
        if (!body.trim() || sending) return;
        setSending(true);
        try {
            const response = await fetch(postUrl, {
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
                const message: GenericChatMessage = await response.json();
                setMessages((current) => [...current, message]);
                setBody('');
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <p className="text-muted-foreground text-sm">
                {isActive ? activeHint : inactiveHint}
            </p>
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
                                    {!isMine && (
                                        <p className="mb-0.5 text-[11px] font-medium opacity-70">
                                            {message.sender_name}
                                        </p>
                                    )}
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

            {isActive ? (
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
                    {inactiveHint}
                </p>
            )}
        </>
    );
}
