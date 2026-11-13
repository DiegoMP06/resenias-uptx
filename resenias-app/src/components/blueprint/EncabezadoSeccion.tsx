import React from 'react';
import { View, Text } from 'react-native';

interface EncabezadoSeccionProps {
  numero?: string;
  titulo: string;
  descripcion?: string;
  color?: 'cyan' | 'amber';
  className?: string;
}

export const EncabezadoSeccion: React.FC<EncabezadoSeccionProps> = ({
  numero,
  titulo,
  descripcion,
  color = 'cyan',
  className = '',
}) => {
  const bordeColor = color === 'cyan' ? 'border-[#22D3EE]' : 'border-[#FFB020]';
  const tagColor = color === 'cyan' ? 'text-[#22D3EE]' : 'text-[#FFB020]';

  return (
    <View className={`border-l-2 ${bordeColor} pl-3 py-0.5 ${className}`}>
      <View className="flex-row items-center gap-2">
        {numero && (
          <Text className={`font-mono text-xs font-semibold uppercase tracking-widest ${tagColor}`}>
            // {numero}
          </Text>
        )}
        <Text className="text-base font-semibold text-[#E6EDF7] tracking-tight">
          {titulo}
        </Text>
      </View>
      {descripcion && (
        <Text className="text-xs text-[#8A97B1] mt-0.5 leading-relaxed">
          {descripcion}
        </Text>
      )}
    </View>
  );
};
