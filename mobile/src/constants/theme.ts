import '@/global.css';

/**
 * AstroTalk "Cosmic" design tokens.
 * Deep night-sky indigo surfaces + gold accents, glassmorphism cards.
 */
export const colors = {
  bg: '#0B0C1A',
  bg2: '#12142B',
  bg3: '#1A1E3A',
  surface: 'rgba(255,255,255,0.05)',
  surfaceStrong: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.09)',
  text: '#F5F6FA',
  textDim: '#9CA0B8',
  textFaint: '#5E6280',
  gold: '#E8B84B',
  goldSoft: 'rgba(232,184,75,0.16)',
  violet: '#6D5BFF',
  violetSoft: 'rgba(109,91,255,0.20)',
  pink: '#FF6BB5',
  success: '#22C55E',
  successSoft: 'rgba(34,197,94,0.16)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239,68,68,0.16)',
  online: '#22C55E',
  white: '#FFFFFF',
} as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const spacing = (n: number) => n * 4;

export const gradient = {
  bg: ['#0B0C1A', '#10122A', '#181C3A'] as [string, string, string],
  gold: ['#F6D67C', '#E8B84B', '#C99A2E'] as [string, string, string],
  violet: ['#6D5BFF', '#8A5BFF', '#B04BFF'] as [string, string, string],
  green: ['#34D399', '#10B981', '#059669'] as [string, string, string],
};

export const shadowCard = {
  shadowColor: '#000',
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

export const typography = {
  hero: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 21, fontWeight: '700' as const },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '500' as const },
  tiny: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.4 },
};

