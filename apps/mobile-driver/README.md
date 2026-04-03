# Eseller Driver App

Жолоочийн мобайл апп — хүргэлтийн даалгавар, GPS мөрдлөг, баталгаажуулалт.

## App Structure
```
app/(driver)/
├── dashboard.tsx          # Идэвхтэй хүргэлтүүд
├── shipments/
│   ├── index.tsx          # Хүргэлтийн жагсаалт
│   └── [id].tsx           # Дэлгэрэнгүй + навигаци
├── confirm/[id].tsx       # PIN / Зураг / QR баталгаажуулалт
├── earnings.tsx           # Орлогын тайлан
├── history.tsx            # Хүргэлтийн түүх
└── settings.tsx           # Профайл + машины мэдээлэл
```

## Key Features
- Background GPS tracking (30 сек / 50м interval)
- Хүргэлт баталгаажуулах: PIN код / Зураг авах / QR скан
- Real-time захиалгын alert
- Google Maps навигаци integration
- Online/Offline горим (offline-д кэш)
- Орлогын тооцоо

## Permissions
- ACCESS_FINE_LOCATION (always)
- CAMERA
- VIBRATE
- RECEIVE_BOOT_COMPLETED (background task)

## Bundle ID
- iOS: mn.eseller.driver
- Android: mn.eseller.driver
