export type UserRole = 'customer' | 'astrologer' | 'admin';

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type AstrologerProfileStatus = 'pending' | 'approved' | 'rejected';

export type AstrologerProfile = {
    bio: string | null;
    specializations: string[];
    languages: string[];
    experience_years: number;
    rate_chat_per_min: string | null;
    rate_call_per_min: string | null;
    rate_video_per_min: string | null;
    status: AstrologerProfileStatus;
    rejection_reason?: string | null;
    rating_avg?: number;
    rating_count?: number;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
