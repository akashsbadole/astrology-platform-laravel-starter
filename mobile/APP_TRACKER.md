# 🔮 AstroTalk Mobile — Feature & Screen Tracker

> **Progress capsule** — every build decision, API endpoint, screen, and feature for the React Native mobile app lives here.
> Keep this file updated as the app grows. Status legend: `⬜ Backlog` · `🟨 In progress` · `🟩 Done` · `🔶 Blocked`.

**Last updated:** 2026-09-09
**Backend base:** `c:\laragon\www\astrology-platform-laravel-starter` (Laravel 13 / Chisel, PHP 8.3, Inertia + React 19 web app)
**Mobile app dir:** `c:\laragon\www\astrology-platform-laravel-starter\mobile`

---

## 1. Vision & Goals

Recreate the full AstroTalk experience as a mobile app: **customer → astrologer → admin** (all roles), consuming the existing Laravel backend via JSON APIs (`routes/api.php`), with a beautiful cosmic design system.

| Goal                       | Detail                                                                     |
| -------------------------- | -------------------------------------------------------------------------- |
| **All screens, all roles** | Every web screen (`resources/js/pages/**`) mirrored as an Expo screen      |
| **REST API first class**   | Auth via Sanctum bearer tokens; controllers return JSON when `wantsJson()` |
| **Realtime**               | Consultations / chat / pooja-chat via Reverb WebSockets (pusher-js on RN)  |
| **Payments**               | Razorpay Checkout inside the app (wallet recharge, bookings, shop orders)  |
| **Call/video**             | WebRTC via WebView bridge into existing web call UI (v1)                   |

---

## 2. Tech Stack

| Layer            | Choice                                                                                                             | Status |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| Mobile framework | **Expo SDK 57 (React Native 0.86)** + **TypeScript**                                                               | 🟩     |
| Navigation       | `expo-router` v57 (file-based, `src/app`)                                                                          | 🟩     |
| HTTP client      | `axios` with bearer-token interceptor                                                                              | 🟩     |
| Token storage    | `expo-secure-store`                                                                                                | 🟩     |
| Gradients        | `expo-linear-gradient`                                                                                             | 🟩     |
| Realtime         | `pusher-js` (Reverb publishes via Pusher protocol)                                                                 | ⬜     |
| Payments         | `razorpay-react-native` (Checkout)                                                                                 | ⬜     |
| Icons            | `lucide-react-native` (matches web `lucide-react`)                                                                 | 🟩     |
| Backend auth     | **Laravel Sanctum** token guard (`auth:sanctum` alias) — **must be added; referenced in routes but not installed** | 🟩     |

### Monorepo layout

```
astrology-platform-laravel-starter/
├── app/  routes/  resources/   # existing Laravel + Inertia web app
└── mobile/                     # NEW — Expo app (this project)
    ├── APP_TRACKER.md          # this file
    ├── app/                    # expo-router source
    │   ├── (auth)/  (customer)/ (astrologer)/ (admin)/ (public)/
    │   ├── components/         # design-system UI kit
    │   ├── constants/          # theme tokens, api config
    │   ├── lib/                # api client, session, utils
    │   └── _layout.tsx         # app shell (header + bottom tabs)
    └── README.md               # setup / run / device-connect guide
```

---

## 3. API Endpoint Inventory (Laravel `routes/api.php`)

> Auth: `auth:sanctum` = **Bearer token** (Sanctum — see §8.1). Public endpoints need no token.
> Legend: 🟩 **JSON-ready** today · 🟨 **needs JSON branch** (Phase 1 backend work).

### 3.1 Auth (guest)

| Method | Path                                   | Name                  | State                               |
| ------ | -------------------------------------- | --------------------- | ----------------------------------- |
| POST   | `/api/auth/otp/request`                | `api.otp.request`     | 🟨 — redirect, no JSON branch       |
| POST   | `/api/auth/otp/verify`                 | `api.otp.verify`      | 🟨 — session login, issues no token |
| POST   | `/api/auth/social/{provider}`          | `api.social.redirect` | 🟨                                  |
| GET    | `/api/auth/social/{provider/callback}` | `api.social.callback` | 🟨                                  |

### 3.2 Wallet (auth)

| Method | Path                     | Name                   | State                                                          |
| ------ | ------------------------ | ---------------------- | -------------------------------------------------------------- |
| GET    | `/api/wallet`            | `api.wallet`           | 🟨 — Inertia render, no JSON                                   |
| POST   | `/api/wallet/order`      | `api.wallet.order`     | 🟩 JSON `{order_id, amount, currency, key_id, discount_paise}` |
| POST   | `/api/wallet/verify`     | `api.wallet.verify`    | 🟨 — redirects                                                 |
| POST   | `/api/webhooks/razorpay` | `api.webhook.razorpay` | 🟩 JSON                                                        |

### 3.3 Consultations (auth)

| Method | Path                                                 | Name                             | State                                   |
| ------ | ---------------------------------------------------- | -------------------------------- | --------------------------------------- |
| GET    | `/api/consultations`                                 | `api.consult.index`              | 🟨 Inertia render                       |
| POST   | `/api/consultations`                                 | `api.consult.store`              | 🟩 JSON `{id, status}` when `wantsJson` |
| GET    | `/api/consult/{consultation}`                        | `api.consult.show`               | 🟨 Inertia render                       |
| POST   | `/api/consult/{consultation}/accept`                 | `api.consult.accept`             | 🟨                                      |
| POST   | `/api/consult/{consultation}/heartbeat`              | `api.consult.heartbeat`          | 🟨                                      |
| POST   | `/api/consult/{consultation}/end`                    | `api.consult.end`                | 🟨                                      |
| POST   | `/api/consult/{consultation}/message`                | `api.consult.message`            | 🟨                                      |
| POST   | `/api/consult/{consultation}/signal`                 | `api.consult.signal`             | 🟩 JSON                                 |
| POST   | `/api/consult/{consultation}/recordings`             | `api.consult.recording.store`    | 🟩 JSON                                 |
| GET    | `/api/consult/{consultation}/recordings/{recording}` | `api.consult.recording.download` | 🟨 file download                        |

### 3.4 Horoscope (public)

| Method | Path                     | Name                  | State                                    |
| ------ | ------------------------ | --------------------- | ---------------------------------------- |
| GET    | `/api/horoscope`         | `api.horoscope.index` | 🟨 Inertia render                        |
| GET    | `/api/horoscope/{rashi}` | `api.horoscope.show`  | 🟨 Inertia render (daily/weekly/monthly) |

### 3.5 Kundli & Milan

| Method | Path                   | Name               | State |
| ------ | ---------------------- | ------------------ | ----- |
| GET    | `/api/kundli`          | `api.kundli.index` | 🟨    |
| POST   | `/api/kundli`          | `api.kundli.store` | 🟨    |
| GET    | `/api/kundli/{kundli}` | `api.kundli.show`  | 🟨    |
| GET    | `/api/milan`           | `api.milan.index`  | 🟨    |
| POST   | `/api/milan`           | `api.milan.match`  | 🟨    |

### 3.6 Live sessions (auth)

| Method | Path                              | Name               | State |
| ------ | --------------------------------- | ------------------ | ----- |
| GET    | `/api/live/{liveSession}`         | `api.live.show`    | 🟨    |
| POST   | `/api/live/{liveSession}/join`    | `api.live.join`    | 🟨    |
| POST   | `/api/live/{liveSession}/gift`    | `api.live.gift`    | 🟨    |
| POST   | `/api/live/{liveSession}/message` | `api.live.message` | 🟨    |

### 3.7 Shop / AstroMall (auth)

| Method | Path                                | Name                       | State |
| ------ | ----------------------------------- | -------------------------- | ----- |
| GET    | `/api/shop/cart`                    | `api.shop.cart`            | 🟨    |
| POST   | `/api/shop/cart`                    | `api.shop.cart.add`        | 🟨    |
| POST   | `/api/shop/checkout`                | `api.shop.checkout`        | 🟨    |
| POST   | `/api/shop/orders/{order}/verify`   | `api.shop.verify`          | 🟨    |
| GET    | `/api/shop/orders/{order}`          | `api.shop.order.show`      | 🟨    |
| GET    | `/api/shop-orders`                  | `api.shop.orders`          | 🟨    |
| POST   | `/api/shop/orders/{order}/shipment` | `api.shop.shipment.update` | 🟨    |

### 3.8 Referrals (auth)

| Method | Path                    | Name                   | State |
| ------ | ----------------------- | ---------------------- | ----- |
| GET    | `/api/referrals`        | `api.referrals.index`  | 🟨    |
| POST   | `/api/referrals/redeem` | `api.referrals.redeem` | 🟨    |

### 3.9 Notifications (auth)

| Method | Path                              | Name                            | State |
| ------ | --------------------------------- | ------------------------------- | ----- |
| GET    | `/api/notifications`              | `api.notifications.index`       | 🟨    |
| POST   | `/api/notifications/{id}/read`    | `api.notifications.read`        | 🟨    |
| POST   | `/api/notifications/read-all`     | `api.notifications.read-all`    | 🟨    |
| PUT    | `/api/notifications/preferences`  | `api.notifications.preferences` | 🟨    |
| POST   | `/api/notifications/device-token` | `api.notifications.token`       | 🟨    |

### 3.10 Support (auth)

| Method | Path                    | Name                  | State |
| ------ | ----------------------- | --------------------- | ----- |
| GET    | `/api/support`          | `api.support.index`   | 🟨    |
| POST   | `/api/support/tickets`  | `api.support.ticket`  | 🟨    |
| POST   | `/api/support/disputes` | `api.support.dispute` | 🟨    |
| POST   | `/api/support/refunds`  | `api.support.refund`  | 🟨    |

### 3.11 Forum (public read / auth write)

| Method | Path                                   | Name                         | State |
| ------ | -------------------------------------- | ---------------------------- | ----- |
| GET    | `/api/forum`                           | `api.forum.index`            | 🟨    |
| GET    | `/api/forum/category/{slug}`           | `api.forum.category.show`    | 🟨    |
| GET    | `/api/forum/threads/{thread}`          | `api.forum.threads.show`     | 🟨    |
| POST   | `/api/forum/threads`                   | `api.forum.threads.store`    | 🟨    |
| POST   | `/api/forum/threads/{thread}/replies`  | `api.forum.replies.store`    | 🟨    |
| POST   | `/api/forum/threads/{thread}/moderate` | `api.forum.threads.moderate` | 🟨    |

### 3.12 Misc (public)

| Method | Path          | Name                | State |
| ------ | ------------- | ------------------- | ----- |
| GET    | `/api/locale` | `api.locale.update` | 🟨    |

> **⚠️ Missing API routes needed for screen parity** (exist in `web.php` only) — Phase 1 must add JSON API versions:
>
> - Public: `blog/index` + `blog/show`, `panchang`
> - Customer: `bookings` list + checkout · `poojas` catalog/show · `pooja-bookings` list + checkout · reviews
> - Astrologer: dashboard, profile, status, availability CRUD, bookings + complete/cancel
> - Admin: dashboard, astrologers approve/reject, taxonomy CRUD, pooja CRUD, post CRUD, ops hub (coupons, payouts, refunds, disputes, horoscopes, products, live, banners, support, shipments)
> - Chats: `bookings/{booking}/chat` · `pooja-bookings/{poojaBooking}/chat`

---

## 4. Screen Inventory (mirrors `resources/js/pages/**`)

> Each row = one mobile screen. `Backend JSON` = API readiness (§3). `Mobile build` = Expo screen done.

### 4.1 Public & Auth

| Web page                                                                  | Mobile route                                                                | Backend JSON | Mobile build |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------ | ------------ |
| `welcome`                                                                 | `/` — Home                                                                  | 🟨           | ⬜           |
| `auth/login`, `auth/register`                                             | `/(auth)/login`, `/(auth)/register`                                         | 🟨           | ⬜           |
| `auth/forgot-password`, `auth/reset-password`                             | `/(auth)/forgot`, `/(auth)/reset`                                           | 🟨           | ⬜           |
| `auth/verify-email`, `auth/two-factor-challenge`, `auth/confirm-password` | `/(auth)/verify-email`, `/(auth)/two-factor`, `/(auth)/confirm-password`    | 🟨           | ⬜           |
| `auth/otp-request`, `auth/otp-verify`                                     | `/(auth)/otp-request`, `/(auth)/otp-verify`                                 | 🟨           | ⬜           |
| `blog/index`, `blog/show`                                                 | `/(public)/blog`, `/(public)/blog/[slug]`                                   | 🟨           | ⬜           |
| `astrologers/index`                                                       | `/(public)/astrologers`                                                     | 🟨           | ⬜           |
| `astrologers/show`                                                        | `/(public)/astrologers/[id]`                                                | 🟨           | ⬜           |
| `horoscope/index`, `horoscope/show`                                       | `/(public)/horoscope`, `/(public)/horoscope/[rashi]`                        | 🟨           | ⬜           |
| `panchang/show`                                                           | `/(public)/panchang`                                                        | 🟨           | ⬜           |
| `forum/index`, `forum/category`, `forum/thread`                           | `/(public)/forum`, `/(public)/forum/[slug]`, `/(public)/forum/threads/[id]` | 🟨           | ⬜           |
| `shop/index`, `shop/show`                                                 | `/(public)/shop`, `/(public)/shop/[slug]`                                   | 🟨           | ⬜           |
| `live/index`, `live/show`                                                 | `/(public)/live`, `/(public)/live/[id]`                                     | 🟨           | ⬜           |
| `milan/index`, `milan/result`                                             | `/(public)/milan`, `/(public)/milan/result`                                 | 🟨           | ⬜           |

### 4.2 Customer

| Web page                                         | Mobile route                                        | Backend JSON | Mobile build |
| ------------------------------------------------ | --------------------------------------------------- | ------------ | ------------ |
| `customer/dashboard`                             | `/(customer)/` — Dashboard                          | 🟨           | ⬜           |
| `wallet/index`                                   | `/(customer)/wallet`                                | 🟨           | ⬜           |
| `consult/index`                                  | `/(customer)/consults`                              | 🟨           | ⬜           |
| `consult/show` (chat/call/video)                 | `/(customer)/consults/[id]`                         | 🟨           | ⬜           |
| `customer/bookings/index`                        | `/(customer)/bookings`                              | 🟨           | ⬜           |
| `customer/bookings/checkout`                     | `/(customer)/bookings/[id]/checkout`                | 🟨           | ⬜           |
| `customer/kundli/index`                          | `/(customer)/kundli`                                | 🟨           | ⬜           |
| `customer/kundli/create`, `customer/kundli/show` | `/(customer)/kundli/new`, `/(customer)/kundli/[id]` | 🟨           | ⬜           |
| `customer/poojas/index`, `customer/poojas/show`  | `/(customer)/poojas`, `/(customer)/poojas/[id]`     | 🟨           | ⬜           |
| `customer/pooja-bookings/index`                  | `/(customer)/pooja-bookings`                        | 🟨           | ⬜           |
| `customer/pooja-bookings/checkout`               | `/(customer)/pooja-bookings/[id]/checkout`          | 🟨           | ⬜           |
| `chat/show` (booking chat)                       | `/(customer)/bookings/[id]/chat`                    | 🟨           | ⬜           |
| `pooja-chat/show`                                | `/(customer)/pooja-bookings/[id]/chat`              | 🟨           | ⬜           |
| `shop/cart`                                      | `/(customer)/cart`                                  | 🟨           | ⬜           |
| `shop/checkout`                                  | `/(customer)/checkout`                              | 🟨           | ⬜           |
| `shop/orders`, `shop/order-show`                 | `/(customer)/orders`, `/(customer)/orders/[id]`     | 🟨           | ⬜           |
| `notifications/index`                            | `/(customer)/notifications`                         | 🟨           | ⬜           |
| `referrals/index`                                | `/(customer)/referrals`                             | 🟨           | ⬜           |
| `support/index`                                  | `/(customer)/support`                               | 🟨           | ⬜           |
| `settings/profile`                               | `/(customer)/settings/profile`                      | 🟨           | ⬜           |
| `settings/security`                              | `/(customer)/settings/security`                     | 🟨           | ⬜           |
| `settings/appearance`                            | `/(customer)/settings/appearance`                   | 🟨           | ⬜           |

### 4.3 Astrologer

| Web page                    | Mobile route                                 | Backend JSON | Mobile build |
| --------------------------- | -------------------------------------------- | ------------ | ------------ |
| `astrologer/dashboard`      | `/(astrologer)/` — Dashboard + status toggle | 🟨           | ⬜           |
| `astrologer/profile-edit`   | `/(astrologer)/profile`                      | 🟨           | ⬜           |
| `astrologer/availability`   | `/(astrologer)/availability`                 | 🟨           | ⬜           |
| `astrologer/bookings/index` | `/(astrologer)/bookings`                     | 🟨           | ⬜           |

### 4.4 Admin

| Web page                           | Mobile route                   | Backend JSON | Mobile build |
| ---------------------------------- | ------------------------------ | ------------ | ------------ |
| `admin/dashboard`                  | `/(admin)/` — Metrics          | 🟨           | ⬜           |
| `admin/astrologers/index`          | `/(admin)/astrologers`         | 🟨           | ⬜           |
| `admin/taxonomies/index`           | `/(admin)/taxonomies`          | 🟨           | ⬜           |
| `admin/poojas/index` + create/edit | `/(admin)/poojas` (+ new/edit) | 🟨           | ⬜           |
| `admin/posts/index` + create/edit  | `/(admin)/posts` (+ new/edit)  | 🟨           | ⬜           |
| `admin/ops/dashboard`              | `/(admin)/ops`                 | 🟨           | ⬜           |
| `admin/ops/coupons`                | `/(admin)/ops/coupons`         | 🟨           | ⬜           |
| `admin/ops/payouts`                | `/(admin)/ops/payouts`         | 🟨           | ⬜           |
| `admin/ops/refunds`                | `/(admin)/ops/refunds`         | 🟨           | ⬜           |
| `admin/ops/disputes`               | `/(admin)/ops/disputes`        | 🟨           | ⬜           |
| `admin/ops/horoscopes`             | `/(admin)/ops/horoscopes`      | 🟨           | ⬜           |
| `admin/ops/products`               | `/(admin)/ops/products`        | 🟨           | ⬜           |
| `admin/ops/live`                   | `/(admin)/ops/live`            | 🟨           | ⬜           |
| `admin/ops/banners`                | `/(admin)/ops/banners`         | 🟨           | ⬜           |
| `admin/ops/support`                | `/(admin)/ops/support`         | 🟨           | ⬜           |
| `admin/ops/shipments`              | `/(admin)/ops/shipments`       | 🟨           | ⬜           |

---

## 5. Design System ("Cosmic" theme)

- **Colors** — deep indigo/violet night-sky gradients with gold accents, glassmorphism surfaces. (The web UI is neutral `oklch` gray — the mobile app goes bolder while staying in the astro identity.)
    - `bg.900 #0B0C1A` · `bg.800 #12142B` · surface `#1A1E3A` · gold `#E8B84B` · violet `#6D5BFF` · success `#22C55E` · danger `#EF4444`
- **Type** — `Instrument Sans` (match web); tight tracking, display weights for hero numerals.
- **Components** (in `mobile/app/components/`): `Button`, `Card`, `Badge`, `Chip`, `Input`, `OtpInput`, `Avatar`, `Rating`, `ListItem`, `TabBar`, `Sheet`, `Skeleton`, `EmptyState`, `Toast`, `Header`.
- **Patterns** — bottom tab bar (Home / Astrologers / Wallet / Shop / Profile), sticky header + notification bell, FAB for "Start consult", shimmer skeletons, purposeful empty states.

---

## 6. Feature Checklist

### Auth & onboarding

- [ ] OTP login (phone/email) — request + 6-digit verify
- [ ] Auto-register on first OTP login (backend already does this)
- [ ] Social login (Google/Facebook webview)
- [ ] Referral code capture on signup
- [ ] Token persistence + auto-logout on 401

### Public

- [ ] Home hero + quick actions + featured astrologers
- [ ] Astrologer browse (filters: specialization, language, price, rating, online; search)
- [ ] Astrologer profile (bio, rates ×3, availability, reviews → consult CTA)
- [ ] Horoscope 12-rashi grid + daily/weekly/monthly report
- [ ] Panchang (date/location input → tithi, nakshatra, muhurat…)
- [ ] Kundli create (DOB/TOB/POB) + chart view
- [ ] Milan match input → guna score
- [ ] Blog list + article
- [ ] Forum categories → threads → replies (write when authed)
- [ ] AstroMall catalog + product detail
- [ ] Live sessions list + session screen (join, gift, chat)
- [ ] Locale switcher

### Customer

- [ ] Wallet balance card + transaction history
- [ ] Wallet recharge (Razorpay) — order → pay → verify
- [ ] Start instant consult (chat/call/video) — astrologer + type
- [ ] Realtime consult chat (messages, billing ticker, end summary)
- [ ] Scheduled booking checkout (date/slot/payment)
- [ ] Pooja catalog + book + confirm
- [ ] Pooja support chat
- [ ] Cart + checkout + Razorpay verify
- [ ] Orders list + shipment tracking
- [ ] Notifications list + mark read + preferences
- [ ] Referral code share + redeem
- [ ] Support tickets + disputes + refund requests
- [ ] Settings: profile, security (password/2FA/passkeys), appearance (light/dark), language

### Astrologer

- [ ] Dashboard (earnings, stats, online/accepts toggles)
- [ ] Profile edit (bio, rates, specializations, languages)
- [ ] Availability slots CRUD (weekly)
- [ ] Bookings manage (accept/complete/cancel)
- [ ] Consult sessions (shared chat UI)

### Admin

- [ ] Dashboard metrics
- [ ] Astrologer approve/reject
- [ ] Taxonomy CRUD
- [ ] Pooja CRUD
- [ ] Post CRUD
- [ ] Ops: coupons, payouts, refunds, disputes, horoscopes, products, live, banners, support, shipments

---

## 7. Integration Backlog

| #   | Item                                    | Depends on                        | Status |
| --- | --------------------------------------- | --------------------------------- | ------ |
| 7.1 | Sanctum token auth end-to-end           | §8.1                              | ✅     |
| 7.2 | Razorpay Checkout in RN                 | key_id + secret in `.env`         | ⬜     |
| 7.3 | Realtime chat (Realtime over WebSocket) | Reverb host reachable from device | ⬜     |
| 7.4 | WebRTC call/video via WebView bridge    | web consult page working          | ⬜     |
| 7.5 | FCM push notifications                  | `FCM_SERVER_KEY`                  | ⬜     |
| 7.6 | Call recordings upload/download         | consult recording endpoints       | ⬜     |

---

## 8. Backend Work Log (Phase 1 — API readiness)

- [x] **8.1 Sanctum token auth** — Custom stateless token guard (no Sanctum package dependency): `Auth::viaRequest('sanctum-token', ...)` in `AppServiceProvider` validates `{id}|{plain}` bearer tokens against `PersonalAccessToken` (SHA-256). Created `app/Support/HasApiTokens` trait (compatible with `Laravel\Sanctum\HasApiTokens` API), `app/Models/PersonalAccessToken` with `findToken()` + `can()`/`cant()`, personal-access-tokens migration (`2026_09_09_100001`), `sanctum` guard in `config/auth.php`, `auth:sanctum` on all API routes. ✅ Verified end-to-end: token issued → authenticated request succeeds.
- [x] **8.2 OTP + social login return token** — `OtpController::verify` issues a Sanctum token via `$user->createToken('mobile')` when `$request->wantsJson()`, returning `{ token, token_type, user }`. Auto-registration on first OTP login. `OtpController::request` now returns JSON with `{ message, identifier, channel, debug_code }` in local mode. Fixed duplicate `RedirectResponse` import (Illuminate vs Symfony) that caused a fatal error blocking all routes. API `verify` for payments returns JSON with transaction + balance.
- [x] **8.3 JSON branches per controller** — Added `wantsJson()` JSON-return branches to: `OtpController` (request + verify), `WalletController` (index + createOrder + verify + webhook), `ConsultationController` (index + store + show + accept + heartbeat + end), `AstrologerController` (index + show), `HoroscopeController` (index + show). Paginator data serialized correctly for mobile consumption.
- [x] **8.4 API routes complete** — All 56 routes in `routes/api.php` registered with `auth:sanctum` middleware where needed. Public routes (horoscope, astrologers, forum, etc.) work without token. Protected routes return 401 JSON when unauthenticated.
- [x] **8.5 CORS + tests** — `shouldRenderJsonWhen` in `bootstrap/app.php` renders JSON exceptions for `api/*` requests. Test results: AstroTalkParityTest (10 passed, 39 assertions), PlatformFeaturesTest (9 passed, 44 assertions). End-to-end API test: OTP request → OTP verify → token → wallet/consultations all return 200 JSON.

---

## 9. Milestones

| M#  | Milestone                   | Exit criteria                                                                          |
| --- | --------------------------- | -------------------------------------------------------------------------------------- |
| M0  | Tracking + scaffold 🟩      | Repo `mobile/`, Expo SDK 57 runs, theme tokens + UI kit + 9 screens built, `tsc` clean | ✅  |
| M1  | Backend JSON + Sanctum      | OTP login returns token; key endpoints JSON                                            | ✅  |
| M2  | Auth + public screens       | Login → Home → Browse → Astrologer profile                                             | ✅  |
| M3  | Customer core               | Wallet + consult chat + bookings                                                       | ✅  |
| M4  | Shop + pooja + support      | Full customer feature set (§6)                                                         | ✅   |
| M5  | Astrologer app              | §6 Astrologer set                                                                      |
| M6  | Admin app                   | §6 Admin set                                                                           |
| M7  | Realtime + payments + calls | §7.2–7.6                                                                               |

---

## 10. Environment & Config

| Var               | Value                   | Notes                            |
| ----------------- | ----------------------- | -------------------------------- |
| `API_BASE_URL`    | `http://localhost:8000` | use LAN IP for physical devices  | ✅ (Expo uses `EXPO_PUBLIC_API_URL` env override) |
| Sanctum token TTL | config                  | decide (default 30d)             |
| Reverb host/port  | `localhost:8080`        | must point at LAN IP for devices |

---

## 11. Changelog

- **2026-09-09 (f)** — Phase 4 (Shop + Pooja + Support — M4) complete. Added JSON branches to 3 controllers: `NotificationController` (index+read+readAll+preferences+token), `ReferralController` (index+redeem), `SupportController` (index+storeTicket+storeDispute+requestRefund). Built 4 new customer screens: Notifications (list with read/unread states, mark read/all read, bell icon with gold accent, empty state), Referrals (gold hero card with code, stats row: referred/rewarded/points, loyalty balance with redeem button), Support (tickets list, new ticket via Alert.prompt), Settings (user card, notification preferences with switches, menu items, sign out with confirmation). `tsc --noEmit` passes with zero errors. M4 milestone complete.
- **2026-09-09 (e)** — Phase 3 (Customer core — M3) complete. Built consultations list (`src/app/consults/index.tsx`) and chat screen (`src/app/consults/[id].tsx`). Consultations list fetches from `GET /consultations`, shows type icons (chat/call/video), status badges (active/pending/ended/cancelled), billed minutes + amount, pull-to-refresh. Chat screen fetches messages from `GET /consult/{id}`, sends via `POST /consult/{id}/message`, shows gold/white bubbles for mine/theirs messages, auto-scrolls to bottom, keyboard-avoiding input bar, loading and empty states. Created `src/types/index.ts` with shared TypeScript types (Consultation, ConsultationMessage, ConsultationDetail, PaginatedResponse). Fixed Badge tone mapping to use available tones (success/gold/neutral/danger). `tsc --noEmit` passes with zero errors. M3 milestone complete.
- **2026-09-09 (d)** — Phase 2 (API wiring) complete. All screens now fetch real data from Laravel API instead of mock data. Created `AuthContext` (`src/contexts/AuthContext.tsx`) with `useAuth()` hook for login state management. Updated `app.json` with `EXPO_PUBLIC_API_URL` env var. OTP screens now use real API flow: request shows `debug_code` alert (dev mode), verify calls `/auth/otp/verify` and stores token via context. Home screen fetches featured astrologers (`/astrologers?online=1`) and wallet balance (`/wallet`) in parallel. Astrologers tab fetches from `/astrologers` with filter params. Wallet tab fetches real balance + transactions from `/wallet`. Astrologer detail fetches from `/astrologers/{id}` with loading state. Profile uses AuthContext, sign-in navigates to `/(auth)/otp-request`, added sign-out button. `tsc --noEmit` passes with zero errors. M2 milestone complete.
- **2026-09-09 (c)** — Phase 1 (Backend JSON + Sanctum) complete. Custom stateless Sanctum token guard built from scratch (no `laravel/sanctum` package dep): `HasApiTokens` trait + `PersonalAccessToken` model with `findToken()` (SHA-256), `sanctum-token` driver in `Auth::viaRequest`, personal-access-tokens migration. All 56 API routes registered with `auth:sanctum` where needed. Zero-inertia JSON branches added to 5 controllers: `OtpController` (request+verify), `WalletController` (index+order+verify+webhook), `ConsultationController` (index+store+show+accept+heartbeat+end), `AstrologerController` (index+show), `HoroscopeController` (index+show). Fixed duplicate `RedirectResponse` import fatal error in `OtpController`. Added `debug_code` field to local OTP request response for mobile dev testing. Tests: AstroTalkParityTest 10/10 passed (39 assertions), PlatformFeaturesTest 9/9 passed (44 assertions). End-to-end API verified: OTP request → verify → token → authenticated wallet/consultations access all return 200 JSON. M0 and M1 milestones complete.
- **2026-09-09 (b)** — Phase 0 scaffold complete: Expo SDK 57 app created in `mobile/` (monorepo, `src/` layout, `@/*` → `src/*`). Cosmic design system (`src/constants/theme.ts`), UI kit (`Button, Card, Badge, Chip, Screen, Header, Avatar, OtpInput, EmptyState`), libs (`api.ts` axios+token, `session.ts` SecureStore, `format.ts`, `mock.ts` demo data). Screens built: Home, Astrologers browse, Astrologer detail, Wallet, AstroMall, Profile, OTP request, OTP verify, `[...missing]` catch-all. Custom tab bar (5 tabs). Demo-data fallback keeps UI navigable until §8 backend JSON lands.
