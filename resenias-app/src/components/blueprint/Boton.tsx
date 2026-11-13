import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface BotonProps {
  variante?: 'primario' | 'secundario' | 'peligro';
  tamano?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icono?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Boton: React.FC<BotonProps> = ({
  variante = 'primario',
  tamano = 'md',
  children,
  icono,
  onPress,
  disabled = false,
  className = '',
}) => {
  const estilosContenedor = {
    primario: 'bg-[#22D3EE] active:bg-[#06B6D4]',
    secundario: 'bg-[#1A2336] border border-[#243049] active:bg-[#243049]',
    peligro: 'bg-[#F87171]/10 border border-[#F87171]/40 active:bg-[#F87171]/20',
  };

  const estilosTexto = {
    primario: 'text-[#04121A] font-semibold',
    secundario: 'text-[#E6EDF7] font-medium',
    peligro: 'text-[#F87171] font-medium',
  };

  const tamanos = {
    sm: 'min-h-[36px] px-3 py-1.5',
    md: 'min-h-[44px] px-4 py-2.5',
    lg: 'min-h-[48px] px-6 py-3',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-[6px] ${tamanos[tamano]} ${estilosContenedor[variante]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
    >
      {icono && <View className="mr-2">{icono}</View>}
      {typeof children === 'string' ? (
        <Text className={`text-sm font-mono ${estilosTexto[variante]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};
