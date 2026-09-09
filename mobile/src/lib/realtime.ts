import Pusher from 'pusher-js';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000';

export type RealtimeOptions = {
    cluster?: string;
    forceTLS?: boolean;
};

let pusherInstance: Pusher | null = null;

export function getPusher(options: RealtimeOptions = {}): Pusher {
    if (pusherInstance) return pusherInstance;

    const key = process.env.EXPO_PUBLIC_PUSHER_KEY ?? 'astrotalk-app';
    const host =
        process.env.EXPO_PUBLIC_PUSHER_HOST ??
        API_URL.replace(/^https?:\/\//, '').replace(/\/api$/, '');
    const port = parseInt(process.env.EXPO_PUBLIC_PUSHER_PORT ?? '8080', 10);

    pusherInstance = new Pusher(key, {
        cluster: options.cluster ?? 'mt1',
        forceTLS: options.forceTLS ?? false,
        wsHost: host,
        wsPort: port,
        wssPort: port,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
    });

    return pusherInstance;
}

export function subscribeToConsultation(
    consultationId: number,
    callbacks: {
        onMessage?: (message: any) => void;
        onEnded?: () => void;
        onSignal?: (signal: any) => void;
        onTick?: (data: any) => void;
    },
) {
    const pusher = getPusher();
    const channel = pusher.subscribe(`consultation.${consultationId}`);

    if (callbacks.onMessage) {
        channel.bind('ConsultationMessageSent', (data: any) =>
            callbacks.onMessage?.(data),
        );
    }
    if (callbacks.onEnded) {
        channel.bind('ConsultationEnded', () => callbacks.onEnded?.());
    }
    if (callbacks.onSignal) {
        channel.bind('CallSignalUpdated', (data: any) =>
            callbacks.onSignal?.(data),
        );
    }
    if (callbacks.onTick) {
        channel.bind('ConsultationTick', (data: any) =>
            callbacks.onTick?.(data),
        );
    }

    return {
        unsubscribe: () => {
            channel.unbind();
            pusher.unsubscribe(`consultation.${consultationId}`);
        },
    };
}
