import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Image, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { QPayAPI, QPayInvoice, LoyaltyAPI, LoyaltyAccount, OrdersAPI } from '../lib/api';
import { useRoleStore } from '../lib/roleStore';

const BRAND = '#E8242C';
const POINTS_TO_MNT = 5;     // 1 оноо = 5₮
const MIN_REDEEM_POINTS = 200;
const MAX_REDEEM_PERCENT = 0.3; // Нийт дүнгийн 30% хүртэл
const DELIVERY_FEE = 3000;
const FREE_DELIVERY_MIN = 50000;

// ─── Demo cart (replace with real cart store later) ───────
const CART_ITEMS = [
  { productId: 'p1', name: 'Sporty гутал Air', price: 69000, quantity: 1, emoji: '👟' },
];

type PaymentMethod = 'qpay' | 'card' | 'cash';
type CheckoutStep = 'form' | 'qpay_qr' | 'success';

export default function CheckoutScreen() {
  const { userId } = useRoleStore();

  // Form state
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qpay');
  const [step, setStep] = useState<CheckoutStep>('form');

  // Loyalty state
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  // QPay state
  const [qpayInvoice, setQpayInvoice] = useState<QPayInvoice | null>(null);
  const [qpayLoading, setQpayLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Order state
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // ─── Calculations ────────────────────────────────────────
  const subtotal = CART_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const loyaltyDiscount = useLoyalty ? loyaltyPoints * POINTS_TO_MNT : 0;
  const maxLoyaltyPoints = Math.min(
    loyaltyAccount?.balance || 0,
    Math.floor((subtotal * MAX_REDEEM_PERCENT) / POINTS_TO_MNT)
  );
  const total = Math.max(0, subtotal + deliveryFee - loyaltyDiscount);

  // ─── Load loyalty account ────────────────────────────────
  useEffect(() => {
    if (userId) {
      LoyaltyAPI.getAccount(userId)
        .then((acc) => {
          setLoyaltyAccount(acc);
          if (acc.balance >= MIN_REDEEM_POINTS) {
            setLoyaltyPoints(Math.min(acc.balance, maxLoyaltyPoints));
          }
        })
        .catch(() => {/* no loyalty account yet */});
    }
  }, [userId]);

  // ─── Cleanup polling on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ─── Submit order ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert('Алдаа', 'Утасны дугаар оруулна уу');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Алдаа', 'Хаяг оруулна уу');
      return;
    }

    setOrderLoading(true);
    try {
      // 1. Create the order
      const order = await OrdersAPI.create({
        items: CART_ITEMS.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total,
        delivery: {
          phone,
          address: { street: address },
        },
        paymentMethod,
        loyaltyDiscount: useLoyalty ? loyaltyDiscount : undefined,
      });

      setOrderId(order.id || order.orderNumber);

      // 2. Redeem loyalty points if used
      if (useLoyalty && loyaltyPoints > 0 && userId) {
        await LoyaltyAPI.redeem({
          userId,
          points: loyaltyPoints,
          type: 'discount',
          orderId: order.id,
        }).catch(() => {/* non-critical */});
      }

      // 3. Handle payment
      if (paymentMethod === 'qpay') {
        await handleQPay(order.id || 'order-' + Date.now(), total);
      } else {
        // Card or Cash — go to success
        setStep('success');
      }
    } catch (err: any) {
      Alert.alert('Алдаа', err.message || 'Захиалга үүсгэхэд алдаа гарлаа');
    } finally {
      setOrderLoading(false);
    }
  };

  // ─── QPay flow ───────────────────────────────────────────
  const handleQPay = async (orderRef: string, amount: number) => {
    setQpayLoading(true);
    try {
      const invoice = await QPayAPI.createInvoice({
        orderId: orderRef,
        amount,
        description: `eseller.mn захиалга #${orderRef}`,
      });
      setQpayInvoice(invoice);
      setStep('qpay_qr');

      // Start polling for payment status
      pollRef.current = setInterval(async () => {
        try {
          const status = await QPayAPI.checkPayment(invoice.invoiceId);
          if (status.paid) {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep('success');
          }
        } catch {}
      }, 3000);
    } catch (err: any) {
      Alert.alert('QPay алдаа', err.message || 'QR үүсгэхэд алдаа гарлаа');
    } finally {
      setQpayLoading(false);
    }
  };

  const openBankApp = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Алдаа', 'Банкны апп суулгаагүй байна')
    );
  };

  // ─── Format price ────────────────────────────────────────
  const fmt = (n: number) => n.toLocaleString() + '₮';

  // ─── STEP: QPay QR ──────────────────────────────────────
  if (step === 'qpay_qr' && qpayInvoice) {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, alignItems: 'center' }}>
          <View style={s.card}>
            <Text style={[s.cardTitle, { textAlign: 'center' }]}>📱 QPay Төлбөр</Text>
            <Text style={s.qpayAmount}>{fmt(total)}</Text>

            {/* QR Image */}
            <View style={s.qrWrap}>
              {qpayInvoice.qrImage ? (
                <Image source={{ uri: qpayInvoice.qrImage }} style={s.qrImage} resizeMode="contain" />
              ) : (
                <View style={[s.qrImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A2A2A' }]}>
                  <Text style={{ color: '#FFF', fontSize: 14 }}>QR код</Text>
                </View>
              )}
            </View>

            <Text style={s.qpayHint}>
              Банкны аппаар QR кодыг уншуулна уу
            </Text>

            {/* Bank app buttons */}
            <View style={s.bankGrid}>
              {qpayInvoice.urls.map((bank) => (
                <TouchableOpacity key={bank.name} style={s.bankBtn}
                  onPress={() => openBankApp(bank.link)}>
                  <Text style={s.bankName}>{bank.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Checking status indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={{ color: '#A0A0A0', fontSize: 13 }}>
              Төлбөр хүлээж байна...
            </Text>
          </View>
        </ScrollView>

        <View style={s.bottomBar}>
          <TouchableOpacity style={[s.payBtn, { backgroundColor: '#333' }]}
            onPress={() => { if (pollRef.current) clearInterval(pollRef.current); setStep('form'); }}>
            <Text style={s.payBtnText}>Буцах</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── STEP: Success ──────────────────────────────────────
  if (step === 'success') {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <View style={s.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        </View>
        <Text style={s.successTitle}>Захиалга амжилттай!</Text>
        <Text style={s.successSub}>
          Таны захиалга баталгаажлаа.{'\n'}
          {loyaltyDiscount > 0 && `Loyalty хямдрал: -${fmt(loyaltyDiscount)}\n`}
          Нийт: {fmt(total)}
        </Text>
        {orderId && (
          <Text style={s.orderNum}>#{orderId}</Text>
        )}
        <TouchableOpacity style={[s.payBtn, { marginTop: 24, width: '100%' }]}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={s.payBtnText}>Нүүр хуудас руу буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── STEP: Checkout Form ────────────────────────────────
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Cart items */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🛒 Сагс</Text>
          {CART_ITEMS.map((item, i) => (
            <View key={i} style={s.cartItem}>
              <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cartName}>{item.name}</Text>
                <Text style={s.cartQty}>{item.quantity} ширхэг</Text>
              </View>
              <Text style={s.cartPrice}>{fmt(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📍 Хүргэлтийн мэдээлэл</Text>
          <TextInput style={s.input} placeholder="Утасны дугаар" placeholderTextColor="#555"
            keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <TextInput style={s.input} placeholder="Хаяг (дүүрэг, хороо, байр)" placeholderTextColor="#555"
            value={address} onChangeText={setAddress} />
          <TextInput style={s.input} placeholder="Нэмэлт тэмдэглэл" placeholderTextColor="#555"
            value={notes} onChangeText={setNotes} />
        </View>

        {/* Loyalty Points */}
        {loyaltyAccount && loyaltyAccount.balance >= MIN_REDEEM_POINTS && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={s.cardTitle}>⭐ Loyalty оноо</Text>
              <View style={s.tierBadge}>
                <Text style={s.tierText}>{loyaltyAccount.tier}</Text>
              </View>
            </View>
            <Text style={s.loyaltyBalance}>
              Боломжит: <Text style={{ color: '#FFF', fontWeight: '800' }}>{loyaltyAccount.balance.toLocaleString()}</Text> оноо
              ({fmt(loyaltyAccount.balance * POINTS_TO_MNT)})
            </Text>

            <TouchableOpacity style={[s.loyaltyToggle, useLoyalty && s.loyaltyToggleActive]}
              onPress={() => setUseLoyalty(!useLoyalty)}>
              <Ionicons name={useLoyalty ? 'checkmark-circle' : 'ellipse-outline'}
                size={22} color={useLoyalty ? '#22C55E' : '#555'} />
              <Text style={[s.loyaltyToggleText, useLoyalty && { color: '#FFF' }]}>
                {useLoyalty
                  ? `${loyaltyPoints.toLocaleString()} оноо ашиглах (-${fmt(loyaltyDiscount)})`
                  : 'Loyalty оноо ашиглах'}
              </Text>
            </TouchableOpacity>

            {useLoyalty && (
              <Text style={s.loyaltyNote}>
                Хамгийн ихдээ нийт дүнгийн {MAX_REDEEM_PERCENT * 100}% хүртэл хасагдана
              </Text>
            )}
          </View>
        )}

        {/* Payment method */}
        <View style={s.card}>
          <Text style={s.cardTitle}>💳 Төлбөрийн хэлбэр</Text>
          {([
            { key: 'qpay' as const, label: 'QPay (QR код)', icon: 'qr-code' as const },
            { key: 'card' as const, label: 'Картаар', icon: 'card' as const },
            { key: 'cash' as const, label: 'Бэлнээр', icon: 'cash' as const },
          ]).map((m) => (
            <TouchableOpacity key={m.key}
              style={[s.payOption, paymentMethod === m.key && s.payOptionActive]}
              onPress={() => setPaymentMethod(m.key)}>
              <Ionicons name={m.icon} size={20}
                color={paymentMethod === m.key ? BRAND : '#777'} />
              <Text style={[s.payText, paymentMethod === m.key && { color: '#FFF' }]}>
                {m.label}
              </Text>
              {paymentMethod === m.key && (
                <Ionicons name="checkmark-circle" size={18} color={BRAND} style={{ marginLeft: 'auto' }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📋 Захиалгын дүн</Text>
          <View style={s.sumRow}>
            <Text style={s.sumLabel}>Барааны дүн</Text>
            <Text style={s.sumValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={s.sumRow}>
            <Text style={s.sumLabel}>Хүргэлт</Text>
            <Text style={[s.sumValue, deliveryFee === 0 && { color: '#22C55E' }]}>
              {deliveryFee === 0 ? 'Үнэгүй' : fmt(deliveryFee)}
            </Text>
          </View>
          {useLoyalty && loyaltyDiscount > 0 && (
            <View style={s.sumRow}>
              <Text style={s.sumLabel}>Loyalty хямдрал</Text>
              <Text style={[s.sumValue, { color: '#22C55E' }]}>-{fmt(loyaltyDiscount)}</Text>
            </View>
          )}
          <View style={[s.sumRow, { borderTopWidth: 0.5, borderTopColor: '#2A2A2A', paddingTop: 10, marginTop: 6 }]}>
            <Text style={[s.sumLabel, { color: '#FFF', fontWeight: '800' }]}>Нийт</Text>
            <Text style={[s.sumValue, { fontSize: 18 }]}>{fmt(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.payBtn} activeOpacity={0.8}
          onPress={handleSubmit} disabled={orderLoading || qpayLoading}>
          {orderLoading || qpayLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={s.payBtnText}>
              {paymentMethod === 'qpay' ? `QPay-р төлөх — ${fmt(total)}` : `Захиалах — ${fmt(total)}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#3D3D3D', gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  input: { backgroundColor: '#2A2A2A', borderRadius: 10, paddingHorizontal: 14, height: 44, color: '#FFF', fontSize: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },

  // Cart
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  cartName: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  cartQty: { fontSize: 12, color: '#777', marginTop: 2 },
  cartPrice: { fontSize: 14, fontWeight: '800', color: BRAND },

  // Payment options
  payOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#2A2A2A', borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  payOptionActive: { borderColor: BRAND, backgroundColor: 'rgba(232,36,44,0.08)' },
  payText: { fontSize: 14, fontWeight: '600', color: '#A0A0A0' },

  // Loyalty
  loyaltyBalance: { fontSize: 13, color: '#A0A0A0' },
  loyaltyToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#2A2A2A', borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: '#3D3D3D' },
  loyaltyToggleActive: { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.08)' },
  loyaltyToggleText: { fontSize: 14, fontWeight: '600', color: '#777' },
  loyaltyNote: { fontSize: 11, color: '#777', fontStyle: 'italic' },
  tierBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tierText: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },

  // Summary
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { fontSize: 13, color: '#A0A0A0' },
  sumValue: { fontSize: 14, fontWeight: '800', color: BRAND },

  // Bottom
  bottomBar: { padding: 16, borderTopWidth: 0.5, borderTopColor: '#2A2A2A', backgroundColor: '#111111' },
  payBtn: { backgroundColor: BRAND, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  // QPay QR
  qpayAmount: { fontSize: 28, fontWeight: '900', color: BRAND, textAlign: 'center', marginVertical: 8 },
  qrWrap: { alignItems: 'center', marginVertical: 16 },
  qrImage: { width: 220, height: 220, borderRadius: 12 },
  qpayHint: { fontSize: 13, color: '#A0A0A0', textAlign: 'center', marginBottom: 12 },
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  bankBtn: { backgroundColor: '#2A2A2A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 0.5, borderColor: '#3D3D3D' },
  bankName: { fontSize: 12, fontWeight: '600', color: '#E0E0E0' },

  // Success
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', lineHeight: 22 },
  orderNum: { fontSize: 16, fontWeight: '700', color: BRAND, marginTop: 12 },
});
