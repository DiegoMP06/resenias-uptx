import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { PenLine, List, BarChart3, Settings } from 'lucide-react-native';
import { IndicadorConexion } from '@/components/blueprint';

function HeaderTitulo() {
  return (
    <View className="flex-row items-center justify-between w-full pr-4">
      <View>
        <Text className="text-base font-mono font-bold text-[#E6EDF7] tracking-wider">
          VOZ POLITÉCNICA
        </Text>
        <Text className="text-[10px] font-mono text-[#8CA0BA]">
          Minería de Textos · UPTlax 7C
        </Text>
      </View>
      <IndicadorConexion />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0F1A',
          borderBottomWidth: 1,
          borderBottomColor: '#243049',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitle: () => <HeaderTitulo />,
        tabBarStyle: {
          backgroundColor: '#0A0F1A',
          borderTopColor: '#243049',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#22D3EE',
        tabBarInactiveTintColor: '#8CA0BA',
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono-Regular',
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Capturar',
          tabBarLabel: 'Capturar',
          tabBarIcon: ({ color, size }) => (
            <PenLine size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="registros"
        options={{
          title: 'Registros',
          tabBarLabel: 'Registros',
          tabBarIcon: ({ color, size }) => (
            <List size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resumen"
        options={{
          title: 'Resumen',
          tabBarLabel: 'Resumen',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size || 20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
