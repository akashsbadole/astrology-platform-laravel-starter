export type ConsultationStatus = 'pending' | 'active' | 'ended' | 'cancelled';

export type ConsultationType = 'chat' | 'call' | 'video';

export type Consultation = {
    id: number;
    type: ConsultationType;
    status: ConsultationStatus;
    end_reason?: string | null;
    missed_by?: string | null;
    rate_per_min: string;
    billed_minutes: number;
    amount: string;
    created_at: string;
    astrologer?: { id: number; name: string };
    customer?: { id: number; name: string };
};

export type ConsultationMessage = {
    id: number;
    sender_id: number;
    sender_name: string;
    body: string;
    created_at: string;
};

export type ConsultationDetail = Consultation & {
    messages: ConsultationMessage[];
    balance: number;
    ice_servers?: Array<Record<string, unknown>>;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
