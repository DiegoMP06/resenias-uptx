import React from 'react';

export type EstadoChip = 'pendiente' | 'enviado' | 'error' | 'info';

interface ChipProps {
  estado: EstadoChip;
  texto?: string;
  className?: string;
}

const CONFIG_CHIP: Record<
  EstadoChip,
  { punto: string; texto: string; borde: string; bg: string; labelDefault: string }
> = {
  pendiente: {
    punto: 'bg-[#FFB020]',
    texto: 'text-[#FFB020]',
    borde: 'border-[#FFB020]/30',
    bg: 'bg-[#FFB020]/10',
    labelDefault: 'PENDIENTE',
  },
  enviado: {
    punto: 'bg-[#34D399]',
    texto: 'text-[#34D399]',
    borde: 'border-[#34D399]/30',
    bg: 'bg-[#34D399]/10',
    labelDefault: 'ENVIADO',
  },
  error: {
    punto: 'bg-[#F87171]',
    texto: 'text-[#F87171]',
    borde: 'border-[#F87171]/30',
    bg: 'bg-[#F87171]/10',
    labelDefault: 'ERROR',
  },
  info: {
    punto: 'bg-[#22D3EE]',
    texto: 'text-[#22D3EE]',
    borde: 'border-[#22D3EE]/30',
    bg: 'bg-[#22D3EE]/10',
    labelDefault: 'ACTIVO',
  },
};

export const Chip: React.FC<ChipProps> = ({
  estado,
  texto,
  className = '',
}) => {
  const cfg = CONFIG_CHIP[estado] ?? CONFIG_CHIP.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] font-mono text-[11px] font-medium uppercase tracking-wider border ${cfg.bg} ${cfg.borde} ${cfg.texto} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.punto} animate-pulse`} />
      {texto ?? cfg.labelDefault}
    </span>
  );
};
