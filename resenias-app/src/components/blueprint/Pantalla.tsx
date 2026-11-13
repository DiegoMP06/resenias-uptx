import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface PantallaProps {
  children: React.ReactNode;
  className?: string;
  conSafeArea?: boolean;
}

export const Pantalla: React.FC<PantallaProps> = ({
  children,
  className = '',
  conSafeArea = true,
}) => {
  return (
    <View style={styles.fondo} className={`flex-1 bg-[#0A0F1A] ${className}`}>
      <StatusBar style="light" />
      {conSafeArea ? (
        <SafeAreaView style={styles.fondo} className="flex-1">
          {children}
        </SafeAreaView>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#0A0F1A',
  },
});
