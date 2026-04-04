import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoleStore, ROLE_META, AppRole } from '../lib/roleStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ALL_ROLES: AppRole[] = ['customer', 'seller', 'driver'];

export default function RoleSwitcher({ visible, onClose }: Props) {
  const { activeRole, availableRoles, setActiveRole, addRole } = useRoleStore();

  const handleSelect = (role: AppRole) => {
    if (!availableRoles.includes(role)) return;
    setActiveRole(role);
    onClose();
  };

  const handleUnlock = () => {
    // Demo: unlock all roles
    ALL_ROLES.forEach((r) => {
      if (!availableRoles.includes(r)) {
        addRole(r, 'demo-entity', r === 'seller' ? 'Миний дэлгүүр' : 'Жолооч #1');
      }
    });
  };

  const allUnlocked = ALL_ROLES.every((r) => availableRoles.includes(r));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={s.handleRow}>
            <View style={s.handle} />
          </View>

          <Text style={s.title}>Цэс сонгох</Text>

          {ALL_ROLES.map((role) => {
            const meta = ROLE_META[role];
            const isActive = activeRole === role;
            const isAvailable = availableRoles.includes(role);

            return (
              <TouchableOpacity
                key={role}
                style={[
                  s.roleCard,
                  isActive && { borderColor: meta.color, borderWidth: 2 },
                  !isAvailable && { opacity: 0.4 },
                ]}
                onPress={() => handleSelect(role)}
                disabled={!isAvailable}
                activeOpacity={0.7}
              >
                <Text style={s.roleEmoji}>{meta.emoji}</Text>
                <View style={s.roleText}>
                  <Text style={s.roleLabel}>{meta.label}</Text>
                  <Text style={s.roleSub}>{meta.sublabel}</Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={24} color={meta.color} />
                )}
              </TouchableOpacity>
            );
          })}

          {!allUnlocked && (
            <TouchableOpacity style={s.unlockBtn} onPress={handleUnlock} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={20} color="#999" />
              <Text style={s.unlockText}>Борлуулагч / Жолооч болох</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.closeBtnText}>Хаах</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  handleRow: { alignItems: 'center', marginBottom: 12 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  roleEmoji: { fontSize: 28, marginRight: 14 },
  roleText: { flex: 1 },
  roleLabel: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  roleSub: { color: '#999', fontSize: 12, marginTop: 2 },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#555',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    gap: 8,
  },
  unlockText: { color: '#999', fontSize: 14, fontWeight: '600' },
  closeBtn: {
    alignItems: 'center',
    marginTop: 16,
    padding: 14,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
  },
  closeBtnText: { color: '#CCC', fontSize: 15, fontWeight: '600' },
});
