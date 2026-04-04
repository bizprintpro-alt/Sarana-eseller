import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useRoleStore, ROLE_META } from '../lib/roleStore';
import RoleSwitcher from './RoleSwitcher';

export default function RoleHeaderButton() {
  const { activeRole, availableRoles } = useRoleStore();
  const [open, setOpen] = useState(false);
  const meta = ROLE_META[activeRole];
  const hasMultiple = availableRoles.length > 1;

  return (
    <>
      <TouchableOpacity
        style={[s.pill, { backgroundColor: meta.color + '22' }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={s.emoji}>{meta.emoji}</Text>
        <Text style={[s.label, { color: meta.color }]}>{meta.label}</Text>
        {hasMultiple && <View style={s.dot} />}
      </TouchableOpacity>
      <RoleSwitcher visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  emoji: { fontSize: 14 },
  label: { fontSize: 12, fontWeight: '700' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E8242C',
    marginLeft: 2,
  },
});
