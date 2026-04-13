import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Бүх талбарыг бөглөнө үү'); return; }
    if (password.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт'); return; }
    setLoading(true); setError('');
    try {
      await register({ name, email, password, phone: phone || undefined });
    } catch (err: any) {
      setError(err.message || 'Бүртгэх боломжгүй');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>eseller<Text style={{ color: '#E8242C' }}>.mn</Text></Text>
        <Text style={s.title}>Бүртгүүлэх</Text>
        <Text style={s.sub}>Шинэ данс үүсгэх</Text>

        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

        <Text style={s.label}>Нэр</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Таны нэр" placeholderTextColor="#555" />

        <Text style={s.label}>Имэйл</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com"
          placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" />

        <Text style={s.label}>Утасны дугаар</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="99112233"
          placeholderTextColor="#555" keyboardType="phone-pad" />

        <Text style={s.label}>Нууц үг</Text>
        <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="6+ тэмдэгт"
          placeholderTextColor="#555" secureTextEntry />

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
          <Text style={s.btnText}>{loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: '#A0A0A0', fontSize: 13 }}>Данстай юу? <Text style={{ color: '#FF4D53', fontWeight: '700' }}>Нэвтрэх</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 22, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  sub: { fontSize: 13, color: '#A0A0A0', marginTop: 2, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#3D3D3D', borderRadius: 10, paddingHorizontal: 16, height: 48, color: '#FFF', fontSize: 14 },
  btn: { backgroundColor: '#E8242C', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  errorBox: { backgroundColor: 'rgba(232,36,44,0.1)', borderRadius: 10, padding: 12, marginBottom: 8 },
  errorText: { color: '#FF4D53', fontSize: 13, fontWeight: '600' },
});
