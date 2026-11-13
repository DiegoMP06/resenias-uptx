import React from 'react';

interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro';
  tamano?: 'md' | 'lg' | 'sm';
  children: React.ReactNode;
  icono?: React.ReactNode;
}

export const Boton: React.FC<BotonProps> = ({
  variante = 'primario',
  tamano = 'md',
  children,
  icono,
  className = '',
  disabled,
  ...props
}) => {
  const estilosBase =
    'inline-flex items-center justify-center font-mono font-medium rounded-[6px] transition-all duration-150 cursor-pointer select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variantes = {
    primario:
      'bg-[#22D3EE] text-[#04121A] hover:bg-[#67E8F9] active:bg-[#06B6D4] focus:ring-4 focus:ring-[#22D3EE]/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] font-semibold',
    secundario:
      'bg-[#1A2336] text-[#E6EDF7] border border-[#243049] hover:border-[#22D3EE]/50 hover:bg-[#243049] active:bg-[#111827] focus:ring-4 focus:ring-[#22D3EE]/20',
    peligro:
      'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/20 active:bg-[#F87171]/30 focus:ring-4 focus:ring-[#F87171]/20',
  };

  const tamanos = {
    sm: 'min-h-[36px] px-3 text-xs gap-1.5',
    md: 'min-h-[44px] px-4 text-sm gap-2',
    lg: 'min-h-[48px] px-6 text-base gap-2.5',
  };

  return (
    <button
      className={`${estilosBase} ${variantes[variante]} ${tamanos[tamano]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icono && <span className="inline-flex shrink-0">{icono}</span>}
      <span>{children}</span>
    </button>
  );
};
