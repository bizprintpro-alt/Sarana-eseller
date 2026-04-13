import { View, Text, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://eseller.mn';

export default function SecurityScreen() {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);

      const stored = await AsyncStorage.getItem('biometric_enabled');
      setBiometricEnabled(stored === 'true');
    }
    init();
  }, []);

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'eSeller нэвтрэлт баталгаажуулах',
        cancelLabel: 'Болих',
      });
      if (result.success) {
        await AsyncStorage.setItem('biometric_enabled', 'true');
        setBiometricEnabled(true);
      }
    } else {
      await AsyncStorage.setItem('biometric_enabled', 'false');
      setBiometricEnabled(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Алдаа', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Алдаа', 'Шинэ нууц үг 6+ тэмдэгтэй байх ёстой');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Алдаа', 'Нууц үг таарахгүй байна');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        Alert.alert('Амжилттай', 'Нууц үг солигдлоо');
        setChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Алдаа', data.error || 'Нууц үг солиход алдаа гарлаа');
      }
    } catch {
      Alert.alert('Алдаа', 'Сүлжээний алдаа');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Аюулгүй байдал</Text>

      {/* Biometric */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Биометр нэвтрэлт</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Face ID / Хурууны хээ</Text>
            <Text style={styles.hint}>
              {biometricAvailable ? 'Төхөөрөмж дэмждэг' : 'Төхөөрөмж дэмжихгүй'}
            </Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometric}
            disabled={!biometricAvailable}
            trackColor={{ false: '#333', true: '#0A84FF' }}
          />
        </View>
      </View>

      {/* Change Password */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Нууц үг солих</Text>
        {!changingPassword ? (
          <TouchableOpacity style={styles.button} onPress={() => setChangingPassword(true)}>
            <Text style={styles.buttonText}>Нууц үг солих</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Одоогийн нууц үг"
              placeholderTextColor="#666"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Шинэ нууц үг"
              placeholderTextColor="#666"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Шинэ нууц үг давтах"
              placeholderTextColor="#666"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#E8242C' }]}
                onPress={changePassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Хадгалж байна...' : 'Хадгалах'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#333' }]}
                onPress={() => setChangingPassword(false)}
              >
                <Text style={styles.buttonText}>Болих</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Sessions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Идэвхтэй session</Text>
        <Text style={styles.hint}>Одоогийн төхөөрөмж</Text>
        <View style={styles.sessionRow}>
          <View style={styles.sessionDot} />
          <Text style={styles.sessionText}>Энэ төхөөрөмж</Text>
          <Text style={styles.sessionActive}>Идэвхтэй</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 20 },
  card: {
    backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#222',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { color: '#fff', fontSize: 14, fontWeight: '600' },
  hint: { color: '#666', fontSize: 12, marginTop: 2 },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: 8, padding: 12, color: '#fff',
    fontSize: 14, marginBottom: 8, borderWidth: 1, borderColor: '#333',
  },
  button: {
    backgroundColor: '#0A84FF', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  sessionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759', marginRight: 8 },
  sessionText: { color: '#ccc', fontSize: 14, flex: 1 },
  sessionActive: { color: '#34C759', fontSize: 12, fontWeight: '600' },
});
