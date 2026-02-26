/**
 * Accordion — TDS 갭 보완, Animated.View height 보간
 * 프로필 환경/건강/트리거 섹션, FAQ 등에 사용
 */
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function Accordion({ title, children, defaultExpanded = false }: AccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const animatedHeight = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggle = () => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.icon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.body, { maxHeight, opacity: animatedHeight }]}>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202632',
  },
  icon: {
    fontSize: 12,
    color: '#8B95A1',
  },
  body: {
    overflow: 'hidden',
  },
  content: {
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
});
