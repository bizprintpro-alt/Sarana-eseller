import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SellerAPI } from '../lib/api';

const ACCENT = '#8B5CF6';

const SHOP_TYPES = [
  { key: 'GENERAL', icon: 'storefront-outline' as const, label: 'Ерөнхий', desc: 'Бүх төрлийн бараа' },
  { key: 'PREORDER', icon: 'time-outline' as const, label: 'Preorder', desc: 'Урьдчилсан захиалга' },
  { key: 'REAL_ESTATE', icon: 'home-outline' as const, label: 'Үл хөдлөх', desc: 'Байр, газар' },
  { key: 'CONSTRUCTION', icon: 'construct-outline' as const, label: 'Барилга', desc: 'Барилгын материал' },
  { key: 'AUTO', icon: 'car-outline' as const, label: 'Авто', desc: 'Машин, сэлбэг' },
  { key: 'SERVICE', icon: 'briefcase-outline' as const, label: 'Үйлчилгээ', desc: 'Засвар, тохижилт' },
  { key: 'DIGITAL', icon: 'cloud-outline' as const, label: 'Дижитал', desc: 'Код, файл, лиценз' },
];

const BANKS = [
  'Хаан банк', 'Голомт банк', 'ХХБ', 'Төрийн банк', 'Худалдаа хөгжлийн банк',
  'Богд банк', 'Капитрон банк', 'Үндэсний хөрөнгө оруулалтын банк',
];

export default function RegisterShopScreen() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Type
  const [shopType, setShopType] = useState('');

  // Step 2: Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3: Media
  const [logo, setLogo] = useState('');
  const [cover, setCover] = useState('');
  const [about, setAbout] = useState('');

  // Step 4: Bank
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const pickImage = async (setter: (v: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  const canNext = () => {
    switch (step) {
      case 1: return !!shopType;
      case 2: return !!name && !!phone;
      case 3: return true;
      case 4: return !!bankName && !!bankAccount;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Upload images
      let logoUrl = '';
      let coverUrl = '';
      if (logo) {
        try { const r = await SellerAPI.uploadImage(logo); logoUrl = r.url || ''; } catch {}
      }
      if (cover) {
        try { const r = await SellerAPI.uploadImage(cover); coverUrl = r.url || ''; } catch {}
      }

      await SellerAPI.createProduct({
        _action: 'register-shop',
        type: shopType,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        phone,
        logo: logoUrl,
        cover: coverUrl,
        about,
        bankName,
        bankAccount,
      });

      Alert.alert('Амжилттай! 🎉', 'Дэлгүүр амжилттай үүслээ', [
        { text: 'Самбар руу', onPress: () => router.replace('/(owner)/dashboard' as any) },
      ]);
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Дэлгүүр үүсгэхэд алдаа');
    }
    setSubmitting(false);
  };

  return (
    <ScrollView style={st.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {/* Progress dots */}
      <View style={st.progressRow}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={st.progressItem}>
            <View style={[st.progressDot, i <= step && st.progressDotActive, i < step && st.progressDotDone]}>
              {i < step ? (
                <Ionicons name="checkmark" size={14} color="#FFF" />
              ) : (
                <Text style={[st.progressNum, i <= step && { color: '#FFF' }]}>{i}</Text>
              )}
            </View>
            {i < 4 && <View style={[st.progressLine, i < step && st.progressLineActive]} />}
          </View>
        ))}
      </View>

      {/* Step 1: Shop Type */}
      {step === 1 && (
        <>
          <Text style={st.stepTitle}>Дэлгүүрийн төрөл</Text>
          <Text style={st.stepSub}>Ямар төрлийн дэлгүүр нээх вэ?</Text>
          <View style={st.typeGrid}>
            {SHOP_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[st.typeCard, shopType === t.key && st.typeCardActive]}
                onPress={() => setShopType(t.key)}
              >
                <Ionicons name={t.icon} size={28} color={shopType === t.key ? ACCENT : '#999'} />
                <Text style={[st.typeLabel, shopType === t.key && { color: '#FFF' }]}>{t.label}</Text>
                <Text style={st.typeDesc}>{t.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Step 2: Info */}
      {step === 2 && (
        <>
          <Text style={st.stepTitle}>Дэлгүүрийн мэдээлэл</Text>
          <TextInput style={st.input} placeholder="Дэлгүүрийн нэр *" placeholderTextColor="#666"
            value={name} onChangeText={setName} />
          <TextInput style={st.input} placeholder="Slug (URL нэр, жишээ: my-shop)" placeholderTextColor="#666"
            value={slug} onChangeText={(t) => setSlug(t.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            autoCapitalize="none" />
          <TextInput style={st.input} placeholder="Утасны дугаар *" placeholderTextColor="#666"
            value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </>
      )}

      {/* Step 3: Media */}
      {step === 3 && (
        <>
          <Text style={st.stepTitle}>Лого & Зураг</Text>
          <View style={st.mediaRow}>
            <TouchableOpacity style={st.mediaPick} onPress={() => pickImage(setLogo)}>
              {logo ? (
                <Image source={{ uri: logo }} style={st.mediaImg} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={28} color="#666" />
                  <Text style={st.mediaLabel}>Лого</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[st.mediaPick, { flex: 2 }]} onPress={() => pickImage(setCover)}>
              {cover ? (
                <Image source={{ uri: cover }} style={st.mediaImg} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={28} color="#666" />
                  <Text style={st.mediaLabel}>Cover зураг</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            style={[st.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Дэлгүүрийн тухай (заавал биш)"
            placeholderTextColor="#666"
            value={about}
            onChangeText={setAbout}
            multiline
          />
        </>
      )}

      {/* Step 4: Bank */}
      {step === 4 && (
        <>
          <Text style={st.stepTitle}>Банкны мэдээлэл</Text>
          <Text style={st.stepSub}>Орлого хүлээн авах данс</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {BANKS.map(b => (
              <TouchableOpacity key={b} style={[st.bankChip, bankName === b && st.bankChipActive]}
                onPress={() => setBankName(b)}>
                <Text style={[st.bankChipText, bankName === b && { color: '#FFF' }]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput style={st.input} placeholder="Дансны дугаар *" placeholderTextColor="#666"
            value={bankAccount} onChangeText={setBankAccount} keyboardType="number-pad" />

          <View style={st.infoCard}>
            <Ionicons name="information-circle" size={18} color="#3B82F6" />
            <Text style={st.infoText}>Эхний 3 сар 0% комисс! Дараа нь зөвхөн 5%.</Text>
          </View>
        </>
      )}

      {/* Navigation buttons */}
      <View style={st.navRow}>
        {step > 1 && (
          <TouchableOpacity style={st.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color="#CCC" />
            <Text style={st.backText}>Буцах</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[st.nextBtn, !canNext() && { opacity: 0.4 }]}
          onPress={step === 4 ? handleSubmit : () => setStep(step + 1)}
          disabled={!canNext() || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={st.nextText}>{step === 4 ? 'Дэлгүүр нээх 🎉' : 'Дараах'}</Text>
              {step < 4 && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28, marginTop: 8 },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#2A2A2A',
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: ACCENT },
  progressDotDone: { backgroundColor: '#22C55E' },
  progressNum: { color: '#666', fontSize: 13, fontWeight: '700' },
  progressLine: { width: 40, height: 2, backgroundColor: '#2A2A2A', marginHorizontal: 4 },
  progressLineActive: { backgroundColor: '#22C55E' },

  stepTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 6 },
  stepSub: { color: '#999', fontSize: 13, marginBottom: 20 },

  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 14, marginBottom: 12, borderWidth: 0.5, borderColor: '#2A2A2A' },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    width: '47%' as any, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A',
  },
  typeCardActive: { borderColor: ACCENT, backgroundColor: ACCENT + '15' },
  typeLabel: { color: '#CCC', fontSize: 13, fontWeight: '700', marginTop: 8 },
  typeDesc: { color: '#777', fontSize: 10, marginTop: 2, textAlign: 'center' },

  mediaRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  mediaPick: {
    flex: 1, height: 120, backgroundColor: '#1A1A1A', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A2A', borderStyle: 'dashed',
  },
  mediaImg: { width: '100%', height: '100%', borderRadius: 14 },
  mediaLabel: { color: '#666', fontSize: 11, marginTop: 4 },

  bankChip: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginRight: 8, borderWidth: 0.5, borderColor: '#2A2A2A' },
  bankChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  bankChipText: { color: '#999', fontSize: 12, fontWeight: '600' },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#3B82F615', borderRadius: 12, padding: 14, marginTop: 8,
    borderWidth: 0.5, borderColor: '#3B82F633',
  },
  infoText: { color: '#3B82F6', fontSize: 12, fontWeight: '600', flex: 1 },

  navRow: { flexDirection: 'row', gap: 10, marginTop: 28 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2A2A2A', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16 },
  backText: { color: '#CCC', fontSize: 14, fontWeight: '700' },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16 },
  nextText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
