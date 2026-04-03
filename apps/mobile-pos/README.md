# Eseller POS App

Дэлгүүрийн POS систем — таблет дээр ажиллах кассын апп.

## App Structure
```
app/(pos)/
├── terminal.tsx           # POS терминал (split view)
├── products.tsx           # Бараа хайх + скан
├── checkout.tsx           # Төлбөр хүлээн авах
├── receipts/
│   ├── index.tsx          # Баримтын жагсаалт
│   └── [id].tsx           # еБаримт QR + хэвлэх
├── reports/
│   ├── daily.tsx          # Өдрийн тайлан
│   └── shift.tsx          # Ээлжийн тайлан
└── settings.tsx           # Printer тохиргоо
```

## Key Features
- 10" tablet landscape горим оновчтой
- Split view: зүүн = бараа grid, баруун = сагс + төлбөр
- Barcode scanner integration
- QPay QR код харуулах (төлбөр авах)
- Bluetooth thermal printer (баримт хэвлэх)
- еБаримт автомат илгээх
- Ээлжийн тайлан (касс нээх/хаах)

## Төлбөрийн аргууд
- Бэлнээр (cash drawer)
- QPay (QR code)
- Карт (NFC/chip terminal)

## Bundle ID
- iOS: mn.eseller.pos
- Android: mn.eseller.pos
