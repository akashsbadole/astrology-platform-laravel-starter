/**
 * Demo data mirroring the Laravel API response shapes.
 * Used as a graceful fallback while the backend JSON branches (tracker §8.3) land.
 * Shapes match: AstrologerController::index, HoroscopeController, WalletController, ShopController.
 */

export type Astrologer = {
    id: number;
    user_id: number;
    name: string;
    bio?: string;
    specializations: string[];
    languages: string[];
    experience_years: number;
    rating_avg: number;
    rating_count: number;
    rate_chat_per_min: number | null;
    rate_call_per_min: number | null;
    rate_video_per_min: number | null;
    is_online: boolean;
    is_first_free: boolean;
};

export const mockAstrologers: Astrologer[] = [
    {
        id: 1,
        user_id: 11,
        name: 'Pandit Ravi Sharma',
        bio: '25+ years of Vedic astrology, palmistry and vastu guidance. Known for precise predictions on career and marriage.',
        specializations: ['Vedic', 'Career', 'Marriage'],
        languages: ['Hindi', 'English'],
        experience_years: 25,
        rating_avg: 4.8,
        rating_count: 1243,
        rate_chat_per_min: 25,
        rate_call_per_min: 35,
        rate_video_per_min: 55,
        is_online: true,
        is_first_free: true,
    },
    {
        id: 2,
        user_id: 12,
        name: 'Astro Meera Iyer',
        bio: 'Tarot reader and energy healer. Love, relationships and soulmate readings with deep empathy.',
        specializations: ['Tarot', 'Love', 'Healing'],
        languages: ['English', 'Tamil'],
        experience_years: 9,
        rating_avg: 4.9,
        rating_count: 2105,
        rate_chat_per_min: 40,
        rate_call_per_min: 50,
        rate_video_per_min: 80,
        is_online: true,
        is_first_free: false,
    },
    {
        id: 3,
        user_id: 13,
        name: 'Acharya Dev Prakash',
        bio: 'Kundli expert and gemstone consultant. Specialises in dosha remedies and muhurat selection.',
        specializations: ['Kundli', 'Vedic', 'Gemstone'],
        languages: ['Hindi'],
        experience_years: 17,
        rating_avg: 4.6,
        rating_count: 876,
        rate_chat_per_min: 18,
        rate_call_per_min: 25,
        rate_video_per_min: 40,
        is_online: false,
        is_first_free: false,
    },
    {
        id: 4,
        user_id: 14,
        name: 'Dr. Ananya Ghosh',
        bio: 'Numerologist and life coach blending Western astrology with practical advice.',
        specializations: ['Numerology', 'Career'],
        languages: ['English', 'Bengali'],
        experience_years: 12,
        rating_avg: 4.7,
        rating_count: 1540,
        rate_chat_per_min: 30,
        rate_call_per_min: 45,
        rate_video_per_min: 65,
        is_online: true,
        is_first_free: true,
    },
    {
        id: 5,
        user_id: 15,
        name: 'Guru Karthik Nair',
        bio: 'Prashna and horary specialist. Fast, to-the-point answers for urgent questions.',
        specializations: ['Prashna', 'Vedic'],
        languages: ['Malayalam', 'English', 'Hindi'],
        experience_years: 21,
        rating_avg: 4.5,
        rating_count: 690,
        rate_chat_per_min: 22,
        rate_call_per_min: 32,
        rate_video_per_min: 48,
        is_online: false,
        is_first_free: false,
    },
    {
        id: 6,
        user_id: 16,
        name: 'Tarot Sana Khan',
        bio: 'Intuitive tarot with angel guidance. Daily affirmation coaching included.',
        specializations: ['Tarot', 'Angel', 'Love'],
        languages: ['English', 'Urdu'],
        experience_years: 7,
        rating_avg: 4.8,
        rating_count: 1875,
        rate_chat_per_min: 35,
        rate_call_per_min: 42,
        rate_video_per_min: 70,
        is_online: true,
        is_first_free: false,
    },
];

export type WalletTransaction = {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    balance_after: number;
    created_at: string;
    meta: Record<string, unknown> | null;
};

export const mockTransactions: WalletTransaction[] = [
    {
        id: 1,
        type: 'credit',
        amount: 500,
        balance_after: 850,
        created_at: '2026-09-08T10:30:00Z',
        meta: { method: 'razorpay' },
    },
    {
        id: 2,
        type: 'debit',
        amount: 120,
        balance_after: 350,
        created_at: '2026-09-07T18:12:00Z',
        meta: { consult: 'Chat with Pandit Ravi' },
    },
    {
        id: 3,
        type: 'debit',
        amount: 230,
        balance_after: 470,
        created_at: '2026-09-06T09:05:00Z',
        meta: { consult: 'Call with Astro Meera' },
    },
    {
        id: 4,
        type: 'credit',
        amount: 1000,
        balance_after: 700,
        created_at: '2026-09-04T14:44:00Z',
        meta: { method: 'razorpay' },
    },
];

export type Product = {
    id: number;
    slug: string;
    name: string;
    price: number;
    mrp: number | null;
    emoji: string;
    tag?: string;
};

export const mockProducts: Product[] = [
    {
        id: 1,
        slug: 'ruby-5ct',
        name: 'Natural Ruby 5ct ( Certified )',
        price: 8999,
        mrp: 12999,
        emoji: '💎',
        tag: 'Bestseller',
    },
    {
        id: 2,
        slug: 'yellow-sapphire',
        name: 'Yellow Sapphire — Pukhraj 3ct',
        price: 6499,
        mrp: null,
        emoji: '🔶',
        tag: 'Guru',
    },
    {
        id: 3,
        slug: 'rudraksha-mukhi',
        name: '5 Mukhi Rudraksha ( Nepali )',
        price: 1499,
        mrp: 1999,
        emoji: '📿',
    },
    {
        id: 4,
        slug: 'navratna-bracelet',
        name: 'Navratna Energy Bracelet',
        price: 999,
        mrp: 1499,
        emoji: '✨',
        tag: 'New',
    },
    {
        id: 5,
        slug: 'saturn-yantra',
        name: 'Shani Yantra — Copper',
        price: 1299,
        mrp: null,
        emoji: '🔱',
    },
    {
        id: 6,
        slug: 'gem-report',
        name: 'Personalised Gem Report',
        price: 499,
        mrp: 999,
        emoji: '📜',
        tag: 'Report',
    },
];

export const RASHIS = [
    'Mesha',
    'Vrishabha',
    'Mithuna',
    'Karka',
    'Simha',
    'Kanya',
    'Tula',
    'Vrishchika',
    'Dhanu',
    'Makara',
    'Kumbha',
    'Meena',
] as const;

export const RASHI_EMOJI: Record<string, string> = {
    Mesha: '♈',
    Vrishabha: '♉',
    Mithuna: '♊',
    Karka: '♋',
    Simha: '♌',
    Kanya: '♍',
    Tula: '♎',
    Vrishchika: '♏',
    Dhanu: '♐',
    Makara: '♑',
    Kumbha: '♒',
    Meena: '♓',
};
