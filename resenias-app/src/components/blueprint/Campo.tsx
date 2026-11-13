import React from 'react';
import { View, Text } from 'react-native';

interface CampoProps {
  label: string;
  error?: string;
  ayuda?: string;
  requerido?: boolean;
  children: React.ReactNode;
}

export const Campo: React.FC<CampoProps> = ({
  label,
  error,
  ayuda,
  requerido = false,
  children,
}) => {
  return (
    <View className="w-full flex-col gap-1.5 my-1.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-xs font-mono uppercase tracking-wider text-[#8A97B1]">
            {label}
          </Text>
          {requerido && <Text className="text-xs text-[#FFB020] ml-1">*</Text>}
        </View>
        {ayuda && (
          <Text className="text-[11px] font-mono text-[#8A97B1]">
            {ayuda}
          </Text>
        )}
      </View>

      <View>{children}</View>

      {error && (
        <View className="flex-row items-center gap-1 mt-0.5">
          <View className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
          <Text className="text-xs font-mono text-[#F87171]">{error}</Text>
        </View>
      )}
    </View>
  );
};
