import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SellerAPI } from '../lib/api';

const ACCENT = '#22C55E';

const TIERS = [
  { key: 'micro', label: 'Микро', range: '1K-10K', bonus: '+2%', color: '#3B82F6', min: 1000, max: 10000 },
  { key: 'influencer', label: 'Инфлюэнсер', range: '10K-100K', bonus: '+3%', color: '#8B5CF6', min: 10000, max: 100000 },
  { key: 'mega', label: 'Мега', range: '100K+', bonus: '+5%', color: '#F59E0B', min: 100000, max: Infinity },
];

const PLATFORMS = [
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok' as const },
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram' as const },
  { key: 'facebook', label: 'Facebook', icon: 'logo-facebook' as const },
];

function getTier(followers: number) {
  if (followers >= 100000) return TIERS[2];
  if (followers >= 10000) return TIERS[1];
  if (followers >= 1000) return TIERS[0];
  return null;
}

export default function InfluencerScreen() {
  const [followers, setFollowers] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    SellerAPI.stats()
      .then(data => {
        setProfile(data);
        if (data?.followers) setFollowers(String(data.followers));
        if (data?.platform) setPlatform(data.platform);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const followerNum = parseInt(followers) || 0;
  const tier = getTier(followerNum);
  const baseRate = profile?.commissionRate || 10;
  const bonusRate = tier ? parseInt(tier.bonus) : 0;
  const totalRate = baseRate + bonusRate;

  const handleSave = async () => {
    setSaving(true);
    try {
      await SellerAPI.updateInfluencer({ followers: followerNum, platform });
      Alert.alert('Амжилттай', 'Мэдээлэл хадгалагдлаа');
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Хадгалахад алдаа');
    }
    setSaving(false);
  };

  if (loading) {
    return <View style={st.center}><ActivityIndicator color={ACCENT} size="large" /></View>;
  }

  return (
    <ScrollView style={st.container} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      {/* Current tier card */}
      <View style={[st.tierCard, tier && { borderColor: tier.color + '44' }]}>
        <Ionicons name="star" size={32} color={tier?.color || '#555'} />
        <View style={{ flex: 1 }}>
          <Text style={st.tierLabel}>{tier?.label || 'Tier байхгүй'}</Text>
          <Text style={st.tierRange}>
            {tier ? `${tier.range} followers` : '1,000+ followers хэрэгтэй'}
          </Text>
        </View>
        <View style={st.rateBadge}>
          <Text style={[st.rateText, tier && { color: tier.color }]}>{totalRate}%</Text>
          <Text style={st.rateLabel}>Комисс</Text>
        </View>
      </View>

      {/* Commission breakdown */}
      <View style={st.breakdownCard}>
        <View style={st.breakRow}>
          <Text style={st.breakLabel}>Суурь комисс</Text>
          <Text style={st.breakValue}>{baseRate}%</Text>
        </View>
        <View style={st.breakRow}>
          <Text style={st.breakLabel}>Инфлюэнсер бонус</Text>
          <Text style={[st.breakValue, { color: ACCENT }]}>+{bonusRate}%</Text>
        </View>
        <View style={[st.breakRow, { borderTopWidth: 1, borderTopColor: '#2A2A2A', paddingTop: 8 }]}>
          <Text style={[st.breakLabel, { color: '#FFF', fontWeight: '800' }]}>Нийт комисс</Text>
          <Text style={[st.breakValue, { color: ACCENT, fontSize: 18 }]}>{totalRate}%</Text>
        </View>
      </View>

      {/* Tier list */}
      <Text style={st.section}>Tier түвшин</Text>
      {TIERS.map(t => {
        const isCurrent = tier?.key === t.key;
        return (
          <View key={t.key} style={[st.tierItem, isCurrent && { borderColor: t.color + '66' }]}>
            <View style={[st.tierDot, { backgroundColor: t.color }]}>
              {isCurrent && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.tierItemLabel, isCurrent && { color: '#FFF' }]}>{t.label}</Text>
              <Text style={st.tierItemRange}>{t.range} followers</Text>
            </View>
            <Text style={[st.tierItemBonus, { color: t.color }]}>{t.bonus}</Text>
          </View>
        );
      })}

      {/* Followers input */}
      <Text style={st.section}>Мэдээлэл шинэчлэх</Text>

      <Text style={st.label}>Followers тоо</Text>
      <TextInput
        style={st.input}
        placeholder="Жишээ: 15000"
        placeholderTextColor="#666"
        value={followers}
        onChangeText={setFollowers}
        keyboardType="number-pad"
      />

      {/* Platform picker */}
      <Text style={st.label}>Платформ</Text>
      <View style={st.platformRow}>
        {PLATFORMS.map(p => (
          <TouchableOpacity key={p.key} style={[st.platformChip, platform === p.key && st.platformActive]}
            onPress={() => setPlatform(p.key)}>
            <Ionicons name={p.icon} size={20} color={platform === p.key ? '#FFF' : '#999'} />
            <Text style={[st.platformText, platform === p.key && { color: '#FFF' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save */}
      <TouchableOpacity style={[st.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#FFF" /> : <Text style={st.saveText}>Хадгалах</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },

  tierCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  tierLabel: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  tierRange: { color: '#999', fontSize: 12, marginTop: 2 },
  rateBadge: { alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 12, padding: 10 },
  rateText: { color: ACCENT, fontSize: 20, fontWeight: '900' },
  rateLabel: { color: '#999', fontSize: 9 },

  breakdownCard: { backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: '#2A2A2A' },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakLabel: { color: '#999', fontSize: 13 },
  breakValue: { color: '#E0E0E0', fontSize: 14, fontWeight: '700' },

  section: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 16, marginBottom: 12 },

  tierItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  tierDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tierItemLabel: { color: '#CCC', fontSize: 14, fontWeight: '700' },
  tierItemRange: { color: '#777', fontSize: 11 },
  tierItemBonus: { fontSize: 16, fontWeight: '900' },

  label: { color: '#CCC', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 16, marginBottom: 16, borderWidth: 0.5, borderColor: '#2A2A2A' },

  platformRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  platformChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 12, borderWidth: 0.5, borderColor: '#2A2A2A',
  },
  platformActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  platformText: { color: '#999', fontSize: 12, fontWeight: '600' },

  saveBtn: { backgroundColor: ACCENT, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
