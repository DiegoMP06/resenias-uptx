import React from 'react';

interface CampoProps {
  label: string;
  error?: string;
  ayuda?: string;
  requerido?: boolean;
  children: React.ReactNode;
  id?: string;
}

export const Campo: React.FC<CampoProps> = ({
  label,
  error,
  ayuda,
  requerido = false,
  children,
  id,
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-mono font-medium tracking-wider uppercase text-[#8A97B1] flex items-center gap-1"
        >
          {label}
          {requerido && <span className="text-[#FFB020]">*</span>}
        </label>
        {ayuda && <span className="text-[11px] font-mono text-[#8A97B1]">{ayuda}</span>}
      </div>

      <div className="relative">{children}</div>

      {error && (
        <span className="text-xs font-mono text-[#F87171] flex items-center gap-1 mt-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F87171]" />
          {error}
        </span>
      )}
    </div>
  );
};
