/**
 * ModalLayout (패턴E) — 바텀시트형 레이아웃
 * 빠른 기록, 반려견 전환, Plan B/C 선택 등에 사용
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export interface ModalLayoutProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  bottomCTA?: { label: string; onPress: () => void };
}

export function ModalLayout({ title, onClose, children, bottomCTA }: ModalLayoutProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>X</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
        {bottomCTA && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.ctaButton} onPress={bottomCTA.onPress} activeOpacity={0.8}>
              <Text style={styles.ctaText}>{bottomCTA.label}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D6DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#202632' },
  closeBtn: { padding: 4 },
  closeIcon: { fontSize: 16, color: '#8B95A1' },
  body: { flex: 0 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  ctaButton: {
    backgroundColor: '#0064FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
