import React from 'react';
import { View } from 'react-native';
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
  const Container = conSafeArea ? SafeAreaView : View;

  return (
    <Container className={`flex-1 bg-[#0A0F1A] ${className}`}>
      <StatusBar style="light" />
      {children}
    </Container>
  );
};
