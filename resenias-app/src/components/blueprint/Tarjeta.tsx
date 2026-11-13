import React from 'react';
import { View } from 'react-native';

interface TarjetaProps {
  children: React.ReactNode;
  className?: string;
  conMarcasRegistro?: boolean;
}

export const Tarjeta: React.FC<TarjetaProps> = ({
  children,
  className = '',
  conMarcasRegistro = true,
}) => {
  return (
    <View
      className={`relative bg-[#111827] border border-[#243049] rounded-[6px] p-4 ${className}`}
    >
      {conMarcasRegistro && (
        <>
          {/* Esquina superior izquierda */}
          <View className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#22D3EE] rounded-tl-[2px]" />
          {/* Esquina superior derecha */}
          <View className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#22D3EE] rounded-tr-[2px]" />
          {/* Esquina inferior izquierda */}
          <View className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#22D3EE] rounded-bl-[2px]" />
          {/* Esquina inferior derecha */}
          <View className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#22D3EE] rounded-br-[2px]" />
        </>
      )}
      {children}
    </View>
  );
};
