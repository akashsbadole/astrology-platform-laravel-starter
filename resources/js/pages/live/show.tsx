import { Head, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCsrfTokenFromCookie } from '@/lib/csrf';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Live room', href: '/live' }];

export default function LiveShow({
    session,
    isParticipant,
    messages: initMessages = [],
}: {
    session: {
        id: number;
        title: string;
        status: string;
        entry_fee: number;
        astrologer_name: string;
    };
    isParticipant: boolean;
    messages?: Array<{ id: number; sender_name: string; body: string }>;
}) {
    const [gifts, setGifts] = useState<
        Array<{ gift: string; amount_paise: number }>
    >([]);
    const [amt, setAmt] = useState('51');
    const [messages, setMessages] = useState(initMessages);
    const [question, setQuestion] = useState('');

    useEcho(
        `live.${session.id}`,
        'LiveGiftSent',
        (p: { gift: string; amount_paise: number }) => {
            setGifts((g) => [...g, p]);
        },
    );
    useEcho<{ id: number; sender_name: string; body: string }>(
        `live.${session.id}`,
        'LiveMessageSent',
        (p) => {
            setMessages((m) => [...m, p]);
        },
    );

    const gift = async () => {
        await fetch(`/live/${session.id}/gift`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
            },
            body: JSON.stringify({ gift: 'rose', amount: parseFloat(amt) }),
        });
    };

    const ask = async () => {
        if (!question.trim()) return;
        const res = await fetch(`/live/${session.id}/message`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
            },
            body: JSON.stringify({ body: question }),
        });
        if (res.ok) {
            const m = await res.json();
            setMessages((cur) => [...cur, m]);
            setQuestion('');
        }
    };

    return (
        <>
            <Head title={session.title} />
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <Heading
                    title={`${session.status === 'live' ? '🔴 ' : ''}${session.title}`}
                    description={`${session.astrologer_name} · entry ₹${session.entry_fee}`}
                />
                {!isParticipant ? (
                    <Button
                        onClick={() => router.post(`/live/${session.id}/join`)}
                    >
                        Join
                        {session.entry_fee > 0
                            ? ` — ₹${session.entry_fee}`
                            : ' free'}
                    </Button>
                ) : (
                    <Card>
                        <CardContent className="space-y-2 py-4">
                            <p className="text-sm">
                                You are in. Gifts support the astrologer (75/25
                                split).
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={amt}
                                    onChange={(e) => setAmt(e.target.value)}
                                    type="number"
                                    className="w-28"
                                />
                                <Button size="sm" onClick={gift}>
                                    Send gift
                                </Button>
                            </div>
                            {gifts.map((g, i) => (
                                <p key={i} className="text-sm">
                                    🎁 {g.gift} ₹
                                    {(g.amount_paise / 100).toFixed(0)}
                                </p>
                            ))}
                            <div className="border-t pt-2">
                                <p className="text-sm font-medium">Q&A</p>
                                <div className="max-h-48 space-y-1 overflow-y-auto py-2">
                                    {messages.map((m) => (
                                        <p key={m.id} className="text-sm">
                                            <span className="font-medium">
                                                {m.sender_name}:
                                            </span>{' '}
                                            {m.body}
                                        </p>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={question}
                                        onChange={(e) =>
                                            setQuestion(e.target.value)
                                        }
                                        placeholder="Ask a question…"
                                    />
                                    <Button size="sm" onClick={ask}>
                                        Ask
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

LiveShow.layout = { breadcrumbs };
