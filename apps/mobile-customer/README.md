# Eseller Customer App

Хэрэглэгчийн мобайл апп — бараа хайх, захиалах, төлөх, мэдээлэл авах.

## Tech Stack
- Expo SDK 51 + React Native 0.74
- Expo Router v3 (file-based routing)
- NativeWind v4 (Tailwind CSS for RN)
- Zustand (state) + React Query (data fetching)
- expo-secure-store (token хадгалалт — NOT AsyncStorage)
- expo-local-authentication (FaceID/TouchID)
- expo-camera (QR/barcode scan)
- expo-notifications (push)

## App Structure
```
app/
├── (auth)/
│   ├── login.tsx          # Утас + OTP нэвтрэлт
│   ├── register.tsx       # Бүртгэл
│   └── dan-verify.tsx     # ДАН баталгаажуулалт
├── (tabs)/
│   ├── index.tsx          # Нүүр feed (бараа + үйлчилгээ)
│   ├── search.tsx         # Хайлт + suggest
│   ├── cart.tsx           # Сагс
│   ├── orders.tsx         # Захиалгууд
│   └── profile.tsx        # Профайл + тохиргоо
├── product/[id].tsx       # Бараа дэлгэрэнгүй
├── store/[slug].tsx       # Дэлгүүр профайл
├── checkout/
│   ├── index.tsx          # Checkout flow
│   ├── payment.tsx        # QPay / Карт төлбөр
│   └── success.tsx        # Амжилттай
├── order/[id].tsx         # Захиалга мөрдөх (tracking)
├── chat/[id].tsx          # Мессеж
└── receipt/[id].tsx       # еБаримт QR харах
```

## Key Features
- Биометр нэвтрэлт (FaceID/TouchID)
- QPay deep link нэгтгэл
- Push notification (захиалгын статус)
- еБаримт QR харуулагч
- Offline-д сүүлд үзсэн бараа кэш

## Setup
```bash
cd apps/mobile-customer
npx expo install
npx expo start
```
