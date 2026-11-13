import React from 'react';
import { View, Text } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

interface IndicadorConexionProps {
  className?: string;
  compacto?: boolean;
}

export const IndicadorConexion: React.FC<IndicadorConexionProps> = ({
  className = '',
  compacto = false,
}) => {
  const netInfo = useNetInfo();
  const enLinea = Boolean(netInfo.isConnected && netInfo.isInternetReachable !== false);

  const colorPunto = enLinea ? 'bg-[#34D399]' : 'bg-[#FFB020]';
  const colorBorde = enLinea ? 'border-[#34D399]/30' : 'border-[#FFB020]/30';
  const colorBg = enLinea ? 'bg-[#34D399]/10' : 'bg-[#FFB020]/10';
  const colorTexto = enLinea ? 'text-[#34D399]' : 'text-[#FFB020]';
  const etiqueta = enLinea ? 'EN LÍNEA' : 'SIN RED';

  return (
    <View
      className={`flex-row items-center border rounded-[4px] px-2 py-0.5 ${colorBg} ${colorBorde} ${className}`}
      accessibilityLabel={`Estado de red: ${etiqueta}`}
    >
      <View className={`w-2 h-2 rounded-full mr-1.5 ${colorPunto}`} />
      <Text className={`font-mono text-[10px] font-semibold tracking-wider ${colorTexto}`}>
        {compacto ? etiqueta : `● ${etiqueta}`}
      </Text>
    </View>
  );
};
