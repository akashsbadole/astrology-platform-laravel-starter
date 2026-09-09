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

export type AstrologerEarnings = {
    total_paise: number;
    pending_paise: number;
    this_month_paise: number;
    total_consultations: number;
};

export type AstrologerProfileData = {
    bio: string | null;
    specializations: string[];
    languages: string[];
    experience_years: number;
    rate_chat_per_min: string;
    rate_call_per_min: string;
    rate_video_per_min: string;
    status: string;
    rejection_reason: string | null;
};

export type AstrologerBooking = {
    id: number;
    customer_name: string;
    consultation_type: string;
    scheduled_at: string;
    duration_minutes: number;
    amount: string;
    status: string;
    payment_status: string;
    is_session_active: boolean;
    customer_notes: string | null;
};
