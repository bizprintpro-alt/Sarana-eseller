# Eseller Seller App

Борлуулагчийн мобайл апп — захиалга авах, бараа удирдах, тайлан харах.

## App Structure
```
app/(seller)/
├── dashboard.tsx          # Борлуулалтын тойм
├── orders/
│   ├── index.tsx          # Real-time захиалгын жагсаалт
│   └── [id].tsx           # Захиалгын дэлгэрэнгүй + статус солих
├── products/
│   ├── index.tsx          # Бараа жагсаалт
│   ├── add.tsx            # Камераар бараа нэмэх (AI suggest)
│   └── [id]/edit.tsx      # Бараа засах
├── chat/index.tsx         # Нэгдсэн inbox
├── analytics/index.tsx    # Борлуулалтын тайлан
├── ebarimт/index.tsx      # еБаримт жагсаалт
└── settings.tsx           # Профайл тохиргоо
```

## Key Features
- WebSocket real-time захиалгын alert (дуу + чичиргээ)
- Камераар бараа нэмэх → AI автомат нэр/ангилал
- Barcode scanner → нөөц шалгах
- еБаримт автомат илгээх
- Push notification (шинэ захиалга)

## Bundle ID
- iOS: mn.eseller.seller
- Android: mn.eseller.seller
