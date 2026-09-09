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

export type AdminStats = {
    total_users: number;
    total_customers: number;
    total_astrologers: number;
    pending_astrologers: number;
    approved_astrologers: number;
};

export type AdminAstrologer = {
    id: number;
    name: string;
    email: string;
    status: string;
    experience_years: number;
    specializations: string[];
    created_at: string;
};

export type AdminOpsStats = {
    gross: number;
    commission: number;
    orders: number;
    payouts_pending: number;
    refunds_open: number;
    disputes_open: number;
    tickets_open: number;
};

export type AdminCoupon = {
    id: number;
    code: string;
    type: string;
    value_paise: number;
    created_at: string;
};

export type AdminPayout = {
    id: number;
    amount_paise: number;
    status: string;
};

export type AdminEarning = {
    id: number;
    gross_paise: number;
    net_paise: number;
    status: string;
};

export type AdminRefund = {
    id: number;
    amount_paise: number;
    status: string;
    user_id: number;
};

export type AdminDispute = {
    id: number;
    status: string;
    resolution: string | null;
};

export type AdminHoroscope = {
    id: number;
    rashi: string;
    period: string;
    title: string | null;
    date: string | null;
};

export type AdminProduct = {
    id: number;
    name: string;
    price_paise: number;
    stock: number;
};

export type AdminLiveSession = {
    id: number;
    title: string;
    status: string;
    astrologer_id: number;
};

export type AdminBanner = {
    id: number;
    title: string | null;
    link: string | null;
    slot: string;
    is_active: boolean;
};

export type AdminSupportTicket = {
    id: number;
    subject: string;
    status: string;
    created_at: string;
};

export type AdminShipmentOrder = {
    id: number;
    customer: string;
    status: string;
    shipping_status: string;
    tracking_number: string | null;
    carrier: string | null;
    total: number;
};

export type Product = {
    id: number;
    slug: string;
    name: string;
    description?: string;
    price: number;
    mrp: number | null;
    stock: number;
    images?: string[];
};
