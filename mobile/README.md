# 🔮 AstroTalk Mobile

React Native (Expo) app for the AstroTalk astrology platform, consuming the Laravel API in the repo root.

**Tracker:** see [`APP_TRACKER.md`](./APP_TRACKER.md) for the full feature/screen/API inventory and progress.

## Prerequisites

- Node 20+
- Laravel backend running at the repo root (serves `http://localhost:8000`)
- [Expo Go](https://expo.dev/go) app on your phone (or an Android emulator)

## Setup

```bash
cd mobile
npm install
```

## Running

```bash
npm start          # Expo dev server (QR code)
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
npm run web        # Browser
```

### Connecting to the Laravel API

Base URL defaults to `http://10.0.2.2:8000/api` (Android emulator → host loopback).

| Environment         | `EXPO_PUBLIC_API_URL`           |
| ------------------- | ------------------------------- |
| Android emulator    | nothing (default works)         |
| iOS simulator / web | `http://localhost:8000/api`     |
| Physical device     | `http://<your-LAN-IP>:8000/api` |

> Until the backend Sanctum/JSON work lands (tracker §8), screens gracefully fall back to
> bundled demo data so the full UI is navigable. API calls surface a friendly "demo mode" note.

## Type-check / lint

```bash
npm run check      # tsc --noEmit
npm run lint
```

## Structure

```
mobile/
├── APP_TRACKER.md          # features, screens, API inventory, milestones
├── app.json                # Expo config (scheme: astrotalk)
├── assets/                 # icons & splash
└── src/
    ├── app/                # expo-router routes
    │   ├── _layout.tsx     # root stack
    │   ├── (tabs)/         # Home · Astrologers · Wallet · AstroMall · Profile
    │   ├── (auth)/         # OTP request / verify
    │   ├── astrologer/[id].tsx
    │   └── [...missing].tsx  # catch-all for screens not built yet
    ├── components/         # AstrologerCard + ui/ (Button, Card, Badge, Chip, OtpInput…)
    ├── constants/theme.ts  # cosmic design tokens
    └── lib/                # api client, session (SecureStore), format, mock data
```
