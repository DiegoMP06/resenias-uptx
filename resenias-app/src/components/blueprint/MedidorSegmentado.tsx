import React from 'react';
import { View, Text } from 'react-native';

interface MedidorSegmentadoProps {
  valor: number;
  meta: number;
  etiqueta?: string;
  subtitulo?: string;
  className?: string;
}

export const MedidorSegmentado: React.FC<MedidorSegmentadoProps> = ({
  valor,
  meta,
  etiqueta,
  subtitulo,
  className = '',
}) => {
  const porcentaje = meta > 0 ? Math.min(Math.round((valor / meta) * 100), 100) : 0;
  const bloquesLlenos = Math.min(Math.round((porcentaje / 100) * 10), 10);

  return (
    <View className={`space-y-1.5 ${className}`}>
      {(etiqueta || meta > 0) && (
        <View className="flex-row items-center justify-between">
          <View>
            {etiqueta && (
              <Text className="text-xs font-mono font-medium text-[#E6EDF7]">
                {etiqueta}
              </Text>
            )}
            {subtitulo && (
              <Text className="text-[10px] font-mono text-[#8CA0BA]">
                {subtitulo}
              </Text>
            )}
          </View>
          <Text className="text-xs font-mono font-bold text-[#22D3EE]">
            {valor} <Text className="text-[#8CA0BA] font-normal">/ {meta}</Text>{' '}
            <Text className="text-[#FFB020]">({porcentaje}%)</Text>
          </Text>
        </View>
      )}

      {/* 10 bloques segmentados estilo Blueprint */}
      <View className="flex-row items-center gap-1">
        {Array.from({ length: 10 }).map((_, idx) => {
          const lleno = idx < bloquesLlenos;
          return (
            <View
              key={idx}
              className={`flex-1 h-3 rounded-[2px] border ${
                lleno
                  ? 'bg-[#22D3EE] border-[#22D3EE] shadow-sm'
                  : 'bg-[#1A2336] border-[#243049]'
              }`}
            />
          );
        })}
      </View>
    </View>
  );
};
