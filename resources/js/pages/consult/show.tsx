import { Head, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCsrfTokenFromCookie } from '@/lib/csrf';
import type { BreadcrumbItem } from '@/types';

type Msg = {
    id: number;
    sender_id: number;
    sender_name: string;
    body: string;
    created_at: string;
};

type Props = {
    consultation: {
        id: number;
        type: string;
        status: string;
        rate_per_min: string;
        billed_seconds: number;
        amount: string;
        customer_name: string;
        astrologer_name: string;
        end_reason: string | null;
    };
    messages: Msg[];
    currentUserId: number;
    balance: number;
    minsLeft: number;
    signal: { channel: string; provider: string } | null;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Consult', href: '#' }];

export default function ConsultShow({
    consultation: init,
    messages: initMsgs,
    currentUserId,
    balance: initBal,
    minsLeft: initMins,
    signal,
}: Props) {
    const [consultation, setConsultation] = useState(init);
    const [messages, setMessages] = useState<Msg[]>(initMsgs);
    const [balance, setBalance] = useState(initBal);
    const [minsLeft, setMinsLeft] = useState(initMins);
    const [body, setBody] = useState('');
    const [callState, setCallState] = useState<'idle' | 'calling' | 'in-call'>(
        'idle',
    );
    const bottomRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const postSignal = async (
        kind: string,
        sdp?: string,
        candidate?: string,
    ) => {
        await fetch(`/consult/${consultation.id}/signal`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
            },
            body: JSON.stringify({ kind, sdp, candidate }),
        });
    };

    const ensurePC = async (video: boolean) => {
        if (pcRef.current) return pcRef.current;
        const pc = new RTCPeerConnection();
        pcRef.current = pc;
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video,
        });
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        if (localVideoRef.current && video)
            localVideoRef.current.srcObject = stream;
        pc.ontrack = (e) => {
            const [s] = e.streams;
            if (remoteVideoRef.current && video)
                remoteVideoRef.current.srcObject = s;
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = s;
        };
        pc.onicecandidate = (e) => {
            if (e.candidate)
                void postSignal(
                    'ice',
                    undefined,
                    JSON.stringify(e.candidate.toJSON()),
                );
        };
        return pc;
    };

    useEcho(
        `consultation.${consultation.id}`,
        'ConsultationTick',
        (p: {
            billed_seconds: number;
            amount_paise: number;
            balance_paise: number;
            mins_left: number;
        }) => {
            setBalance(p.balance_paise / 100);
            setMinsLeft(p.mins_left);
            setConsultation((c) => ({
                ...c,
                billed_seconds: p.billed_seconds,
                amount: String(p.amount_paise / 100),
            }));
        },
    );
    useEcho(`consultation.${consultation.id}`, 'ConsultationEnded', () => {
        setConsultation((c) => ({ ...c, status: 'ended' }));
    });
    useEcho<Msg>(
        `consultation.${consultation.id}`,
        'ConsultationMessageSent',
        (p) => {
            setMessages((c) => [...c, p]);
        },
    );
    useEcho<{
        kind: string;
        data: { from: number; sdp: string | null; candidate: string | null };
    }>(`consultation.${consultation.id}`, 'CallSignalUpdated', async (p) => {
        if (p.data.from === currentUserId) return;
        const video = consultation.type === 'video';
        try {
            if (p.kind === 'offer' && p.data.sdp) {
                const pc = await ensurePC(video);
                await pc.setRemoteDescription(JSON.parse(p.data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await postSignal('answer', JSON.stringify(pc.localDescription));
                setCallState('in-call');
            } else if (p.kind === 'answer' && p.data.sdp && pcRef.current) {
                await pcRef.current.setRemoteDescription(
                    JSON.parse(p.data.sdp),
                );
                setCallState('in-call');
            } else if (p.kind === 'ice' && p.data.candidate && pcRef.current) {
                await pcRef.current.addIceCandidate(
                    JSON.parse(p.data.candidate),
                );
            } else if (p.kind === 'leave') {
                setCallState('idle');
            }
        } catch {
            // keep chat usable if media fails
        }
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // heartbeat every 30s while active
    useEffect(() => {
        if (consultation.status !== 'active') return;
        const t = setInterval(async () => {
            const res = await fetch(`/consult/${consultation.id}/heartbeat`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
                },
                body: JSON.stringify({ seconds: 30 }),
            });
            if (res.ok) {
                const j = await res.json();
                setBalance(j.balance);
                setMinsLeft(j.mins_left);
                setConsultation((c) => ({
                    ...c,
                    billed_seconds: j.billed_seconds,
                    amount: String(j.amount),
                    status: j.status,
                }));
            }
        }, 30000);
        return () => clearInterval(t);
    }, [consultation.id, consultation.status]);

    const send = async (e: FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        const res = await fetch(`/consult/${consultation.id}/message`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCsrfTokenFromCookie(),
            },
            body: JSON.stringify({ body }),
        });
        if (res.ok) {
            const m = await res.json();
            setMessages((c) => [...c, m]);
            setBody('');
        }
    };

    const startCall = async () => {
        try {
            const video = consultation.type === 'video';
            const pc = await ensurePC(video);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await postSignal('offer', JSON.stringify(pc.localDescription));
            setCallState('calling');
        } catch {
            alert('Mic/camera blocked. Chat still works.');
        }
    };

    const leaveCall = async () => {
        await postSignal('leave');
        pcRef.current?.close();
        pcRef.current = null;
        setCallState('idle');
    };

    useEffect(
        () => () => {
            pcRef.current?.close();
        },
        [],
    );

    const mm = Math.floor(consultation.billed_seconds / 60);
    const ss = consultation.billed_seconds % 60;

    return (
        <>
            <Head title={`Consult #${consultation.id}`} />
            <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
                <Heading
                    title={`${consultation.type.toUpperCase()} with ${consultation.astrologer_name}`}
                    description={`₹${consultation.rate_per_min}/min · ${mm}m ${ss}s · ₹${consultation.amount} · Balance ₹${balance.toFixed(2)} (${minsLeft.toFixed(1)} min left)`}
                />
                {minsLeft <= 2 && consultation.status === 'active' && (
                    <p className="rounded bg-amber-100 p-2 text-sm text-amber-800">
                        Low balance! Recharge to continue — session auto-ends at
                        ₹0.
                    </p>
                )}
                {consultation.status === 'queued' && (
                    <Button
                        onClick={() =>
                            router.post(`/consult/${consultation.id}/accept`)
                        }
                    >
                        Accept (astrologer) / waiting…
                    </Button>
                )}
                {(consultation.type === 'call' ||
                    consultation.type === 'video') && (
                    <Card>
                        <CardContent className="space-y-2 py-4">
                            <p className="text-muted-foreground text-sm">
                                Real P2P {consultation.type} via{' '}
                                {signal?.provider ?? 'reverb'} channel{' '}
                                {signal?.channel ??
                                    `consult-${consultation.id}`}
                                . Timer + billing shared with chat. State:{' '}
                                {callState}.
                            </p>
                            {consultation.type === 'video' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="h-36 w-full rounded bg-black"
                                    />
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className="h-36 w-full rounded bg-black"
                                    />
                                </div>
                            )}
                            <audio ref={remoteAudioRef} autoPlay />
                            <div className="flex gap-2">
                                {callState === 'idle' ? (
                                    <Button size="sm" onClick={startCall}>
                                        Start {consultation.type}
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={leaveCall}
                                    >
                                        Leave call (chat continues)
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router.post(
                                            `/consult/${consultation.id}/end`,
                                        )
                                    }
                                >
                                    End session
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card className="flex min-h-64 flex-col">
                    <CardContent className="flex-1 space-y-2 overflow-y-auto py-4">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded px-3 py-2 text-sm ${m.sender_id === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                >
                                    {m.body}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </CardContent>
                </Card>
                {consultation.status === 'active' ? (
                    <form onSubmit={send} className="flex gap-2">
                        <input
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Type…"
                            className="h-10 flex-1 rounded border px-3 text-sm"
                        />
                        <Button type="submit">Send</Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.post(`/consult/${consultation.id}/end`)
                            }
                        >
                            End
                        </Button>
                    </form>
                ) : (
                    <p className="text-muted-foreground text-center text-sm">
                        Session {consultation.status}
                        {consultation.end_reason
                            ? ` (${consultation.end_reason})`
                            : ''}
                        .
                    </p>
                )}
            </div>
        </>
    );
}

ConsultShow.layout = { breadcrumbs };
