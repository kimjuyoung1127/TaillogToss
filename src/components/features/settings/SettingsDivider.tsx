import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from 'styles/tokens';

export function SettingsDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.surfaceTertiary,
    marginLeft: 20,
  },
});
