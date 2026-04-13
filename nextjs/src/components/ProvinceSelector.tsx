'use client';

import { useState } from 'react';

export const MONGOLIA_LOCATIONS: Record<string, {
  code: string; fee: number; days: number; free?: boolean;
  districts: string[];
}> = {
  'Улаанбаатар': {
    code: 'UB', fee: 0, days: 0, free: true,
    districts: [
      'Баганuur', 'Багахангай', 'Баянгол', 'Баянзүрх',
      'Буянт-Ухаа', 'Налайх', 'Сонгинохайрхан',
      'Сүхбаатар', 'Хан-Уул', 'Чингэлтэй',
    ],
  },
  'Архангай': {
    code: 'ARH', fee: 12000, days: 3,
    districts: [
      'Эрдэнэбулган', 'Батцэнгэл', 'Булган', 'Жаргалант',
      'Өгийнуур', 'Өлзийт', 'Өндөр-Улаан', 'Тариат',
      'Төвшрүүлэх', 'Хайрхан', 'Хангай', 'Хашаат',
      'Хотонт', 'Цахир', 'Цэнхэр', 'Цэцэрлэг',
      'Чулуут', 'Эрдэнэмандал',
    ],
  },
  'Баян-Өлгий': {
    code: 'BYN', fee: 20000, days: 6,
    districts: [
      'Өлгий', 'Алтай', 'Алтанцөгц', 'Баяннуур',
      'Бугат', 'Булган', 'Бүрэгхангай', 'Дэлүүн',
      'Зуунгови', 'Ногооннуур', 'Сагсай', 'Толбо',
      'Улаанхус', 'Цэнгэл',
    ],
  },
  'Баянхонгор': {
    code: 'BHN', fee: 15000, days: 4,
    districts: [
      'Баянхонгор', 'Баацагаан', 'Баян-Өндөр', 'Баянбулаг',
      'Баянговь', 'Баянлиг', 'Баянтоорой', 'Баянцагаан',
      'Богд', 'Бөмбөгөр', 'Бууцагаан', 'Галуут',
      'Гурванбулаг', 'Жаргалант', 'Жинст', 'Заг',
      'Өлзийт', 'Хүрээмарал', 'Шинэжинст', 'Эрдэнэцогт',
    ],
  },
  'Булган': {
    code: 'BLG', fee: 10000, days: 3,
    districts: [
      'Булган', 'Баян-Агт', 'Баяннуур', 'Бүрэгхангай',
      'Гурванбулаг', 'Дашинчилэн', 'Могод', 'Орхон',
      'Сайхан', 'Сэлэнгэ', 'Тэшиг', 'Хангал',
      'Хишиг-Өндөр', 'Хутаг-Өндөр',
    ],
  },
  'Говь-Алтай': {
    code: 'GOV', fee: 18000, days: 5,
    districts: [
      'Есөнбулаг', 'Алтай', 'Баян-Уул', 'Бигэр',
      'Бугат', 'Дарив', 'Дэлгэр', 'Жаргалан',
      'Төгрөг', 'Тонхил', 'Тайшир', 'Халиун',
      'Хөхморьт', 'Цогт', 'Цээл', 'Чарас',
      'Шарга', 'Эрдэнэ',
    ],
  },
  'Говьсүмбэр': {
    code: 'GBI', fee: 9000, days: 2,
    districts: ['Чойр', 'Баянтал', 'Шивээговь'],
  },
  'Дархан-Уул': {
    code: 'DRU', fee: 6000, days: 1,
    districts: ['Дархан', 'Орхон', 'Хонгор', 'Шарын гол'],
  },
  'Дорноговь': {
    code: 'DRG', fee: 15000, days: 4,
    districts: [
      'Сайншанд', 'Айраг', 'Алтанширээ', 'Дэлгэрэх',
      'Замын-Үүд', 'Иххэт', 'Мандах', 'Өргөн',
      'Сайхандулаан', 'Улаанбадрах', 'Хатанбулаг',
      'Хөвсгөл', 'Эрдэнэ',
    ],
  },
  'Дорнод': {
    code: 'DOD', fee: 18000, days: 5,
    districts: [
      'Чойбалсан', 'Баян-Уул', 'Баяндун', 'Баянтүмэн',
      'Булган', 'Гурванзагал', 'Дашбалбар', 'Матад',
      'Сэргэлэн', 'Халхгол', 'Хөлөнбуйр', 'Цагаан-Овоо',
      'Чулуунхороот',
    ],
  },
  'Дундговь': {
    code: 'DND', fee: 12000, days: 3,
    districts: [
      'Мандалговь', 'Адаацаг', 'Баянжаргалан', 'Говь-Угтаал',
      'Гурвансайхан', 'Дэлгэрхангай', 'Дэлгэрцогт', 'Дэрэн',
      'Луус', 'Өлзийт', 'Өндөршил', 'Сайнцагаан',
      'Сайхан-Овоо', 'Цагаандэлгэр', 'Эрдэнэдалай',
    ],
  },
  'Завхан': {
    code: 'ZAV', fee: 18000, days: 5,
    districts: [
      'Улиастай', 'Алдархаан', 'Асгат', 'Баянтэс',
      'Баянхайрхан', 'Дөрвөлжин', 'Завханмандал', 'Идэр',
      'Их-Уул', 'Нөмрөг', 'Отгон', 'Санжит',
      'Сонгино', 'Тосонцэнгэл', 'Түдэвтэй', 'Тэлмэн',
      'Тэс', 'Ургамал', 'Цагаанхайрхан', 'Цагаанчулуут',
      'Цэцэн-Уул', 'Шилүүстэй', 'Эрдэнэхайрхан',
    ],
  },
  'Орхон': {
    code: 'ORH', fee: 8000, days: 2,
    districts: ['Эрдэнэт', 'Баян-Өндөр', 'Жаргалант'],
  },
  'Өвөрхангай': {
    code: 'OVR', fee: 12000, days: 3,
    districts: [
      'Арвайхээр', 'Баруунбаян-Улаан', 'Богд', 'Бүрд',
      'Гучин-Ус', 'Есөнзүйл', 'Зүүнбаян-Улаан',
      'Нарийнтээл', 'Өлзийт', 'Сант', 'Тарагт',
      'Төгрөг', 'Уянга', 'Хархорин', 'Хужирт',
    ],
  },
  'Өмнөговь': {
    code: 'OMN', fee: 15000, days: 4,
    districts: [
      'Даланзадгад', 'Баян-Овоо', 'Баяндалай', 'Булган',
      'Гурвантэс', 'Мандал-Овоо', 'Манлай', 'Номгон',
      'Ноён', 'Сэврэй', 'Хангай', 'Хүрмэн',
      'Цогт-Овоо', 'Цогтцэций',
    ],
  },
  'Сүхбаатар': {
    code: 'SHN', fee: 15000, days: 4,
    districts: [
      'Баруун-Урт', 'Асгат', 'Баяндэлгэр', 'Дарьганга',
      'Мөнххаан', 'Наран', 'Онгон', 'Сүхбаатар',
      'Түвшинширэ', 'Уулбаян', 'Халзан', 'Эрдэнэцагаан',
    ],
  },
  'Сэлэнгэ': {
    code: 'SEL', fee: 8000, days: 2,
    districts: [
      'Сүхбаатар', 'Алтанбулаг', 'Баруунбүрэн', 'Баянгол',
      'Ерөө', 'Жавхлант', 'Зүүнбүрэн', 'Мандал',
      'Орхон', 'Орхонтуул', 'Сайхан', 'Сант',
      'Түшиг', 'Хушаат', 'Цагааннуур', 'Шаамар',
    ],
  },
  'Төв': {
    code: 'TOV', fee: 8000, days: 2,
    districts: [
      'Зуунмод', 'Алтанбулаг', 'Аргалант', 'Архуст',
      'Баян', 'Баяндэлгэр', 'Баянжаргалан', 'Баянхангай',
      'Баянцагаан', 'Баянчандмань', 'Борнуур', 'Бүрэн',
      'Дэлгэрхаан', 'Жаргалант', 'Заамар', 'Лүн',
      'Мөнгөнморьт', 'Өндөрширээт', 'Сэргэлэн',
      'Угтаалцайдам', 'Цээл', 'Эрдэнэ', 'Эрдэнэсант',
    ],
  },
  'Увс': {
    code: 'UVS', fee: 18000, days: 5,
    districts: [
      'Улаангом', 'Баруунтуруун', 'Бөхмөрөн', 'Давст',
      'Завхан', 'Зүүнговь', 'Зүүнхангай', 'Малчин',
      'Наранбулаг', 'Өлгий', 'Өмнөговь', 'Сагил',
      'Тариалан', 'Тэс', 'Түргэн', 'Үенч',
      'Ховд', 'Хяргас', 'Цагаанхайрхан',
    ],
  },
  'Ховд': {
    code: 'HVD', fee: 18000, days: 5,
    districts: [
      'Ховд', 'Алтай', 'Булган', 'Буянт',
      'Дарви', 'Дөргөн', 'Дуут', 'Жаргалант',
      'Зэрэг', 'Манхан', 'Мөнххайрхан', 'Мөст',
      'Мянгад', 'Үенч', 'Цэцэг', 'Чандмань',
      'Эрдэнэбүрэн',
    ],
  },
  'Хөвсгөл': {
    code: 'HOV', fee: 16000, days: 4,
    districts: [
      'Мөрөн', 'Алаг-Эрдэнэ', 'Арбулаг', 'Баянзүрх',
      'Бүрэнтогтох', 'Галт', 'Жаргалант', 'Их-Уул',
      'Рашаант', 'Рэнчинлхүмбэ', 'Тариалан', 'Тосонцэнгэл',
      'Түнэл', 'Улаан-Уул', 'Ханх', 'Хатгал',
      'Цагаан-Үүр', 'Цэцэрлэг', 'Чандмань-Өндөр',
      'Шинэ-Идэр', 'Эрдэнэбулган',
    ],
  },
  'Хэнтий': {
    code: 'HNT', fee: 14000, days: 4,
    districts: [
      'Өндөрхаан', 'Батноров', 'Батширээт', 'Биндэр',
      'Галшар', 'Дадал', 'Дархан', 'Дэлгэрхаан',
      'Жаргалтхаан', 'Мөрөн', 'Норовлин', 'Өлзийт',
      'Цэнхэрмандал',
    ],
  },
};

interface Props {
  value?: string;
  district?: string;
  onChange: (province: string, district: string, fee: number, days: number) => void;
  orderAmount?: number;
  isGold?: boolean;
}

export function ProvinceSelector({
  value = 'Улаанбаатар',
  district = '',
  onChange,
  orderAmount = 0,
  isGold = false,
}: Props) {
  const [selectedProvince, setSelectedProvince] = useState(value);
  const [selectedDistrict, setSelectedDistrict] = useState(district);

  const isFreeDelivery = isGold || orderAmount >= 50000;
  const provinces = Object.keys(MONGOLIA_LOCATIONS);
  const current = MONGOLIA_LOCATIONS[selectedProvince];
  const districts = current?.districts ?? [];

  function handleProvince(name: string) {
    setSelectedProvince(name);
    setSelectedDistrict('');
    const loc = MONGOLIA_LOCATIONS[name];
    const fee = isFreeDelivery || loc.free ? 0 : loc.fee;
    onChange(name, '', fee, loc.days);
  }

  function handleDistrict(dist: string) {
    setSelectedDistrict(dist);
    const loc = MONGOLIA_LOCATIONS[selectedProvince];
    const fee = isFreeDelivery || loc.free ? 0 : loc.fee;
    onChange(selectedProvince, dist, fee, loc.days);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Аймаг сонгох */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 6, display: 'block' }}>
          Аймаг / Нийслэл
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => handleProvince(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '.5px solid #d0d0d0', fontSize: 13, background: '#fff' }}
        >
          {provinces.map((p) => {
            const loc = MONGOLIA_LOCATIONS[p];
            return (
              <option key={p} value={p}>
                {p} — {isFreeDelivery || loc.free
                  ? 'Үнэгүй'
                  : `${loc.fee.toLocaleString()}₮, ${loc.days === 0 ? 'өнөөдөр' : `${loc.days} хоног`}`}
              </option>
            );
          })}
        </select>
      </div>

      {/* Сум / Дүүрэг сонгох */}
      {districts.length > 0 && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 6, display: 'block' }}>
            {selectedProvince === 'Улаанбаатар' ? 'Дүүрэг' : 'Сум'}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrict(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '.5px solid #d0d0d0', fontSize: 13, background: '#fff' }}
          >
            <option value="">
              {selectedProvince === 'Улаанбаатар' ? 'Дүүрэг сонгоно уу' : 'Сум сонгоно уу'}
            </option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {/* Хүргэлтийн мэдээлэл */}
      {current && (
        <div style={{
          padding: '10px 14px',
          background: current.free || isFreeDelivery ? '#E8F5E9' : '#F0F7FF',
          borderRadius: 8, fontSize: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#1B3A5C' }}>
            {selectedProvince}
            {selectedDistrict ? `, ${selectedDistrict}` : ''}
            {' — '}
            {current.days === 0 ? 'Өнөөдөр хүргэнэ' : `${current.days} хоногт хүргэнэ`}
          </span>
          <span style={{ fontWeight: 600, color: current.free || isFreeDelivery ? '#2E7D32' : '#1B3A5C' }}>
            {current.free || isFreeDelivery ? 'Үнэгүй' : `${current.fee.toLocaleString()}₮`}
          </span>
        </div>
      )}

      {isGold && (
        <p style={{ fontSize: 11, color: '#C0953C', margin: 0 }}>
          Gold гишүүн — 21 аймаг бүгдэд үнэгүй хүргэлт
        </p>
      )}
    </div>
  );
}
