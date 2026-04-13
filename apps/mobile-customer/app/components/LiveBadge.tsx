import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface LiveBadgeProps {
  isLive?: boolean;
  currentLiveId?: string | null;
  size?: 'sm' | 'md';
}

export function LiveBadge({ isLive, currentLiveId, size = 'sm' }: LiveBadgeProps) {
  if (!isLive) return null;

  const badge = (
    <View style={[styles.badge, size === 'md' && styles.badgeMd]}>
      <View style={[styles.dot, size === 'md' && styles.dotMd]} />
      <Text style={[styles.text, size === 'md' && styles.textMd]}>LIVE</Text>
    </View>
  );

  if (currentLiveId) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => router.push(`/(customer)/live/${currentLiveId}`)}
        activeOpacity={0.8}
      >
        {badge}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{badge}</View>;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF0000',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#fff',
  },
  dotMd: {
    width: 6,
    height: 6,
  },
  text: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  textMd: {
    fontSize: 11,
  },
});
