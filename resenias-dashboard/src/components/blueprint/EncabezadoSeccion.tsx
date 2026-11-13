import React from 'react';

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
  const colorBorde = color === 'cyan' ? 'border-[#22D3EE]' : 'border-[#FFB020]';
  const colorTextoTag = color === 'cyan' ? 'text-[#22D3EE]' : 'text-[#FFB020]';

  return (
    <div className={`border-l-2 ${colorBorde} pl-3 py-0.5 ${className}`}>
      <div className="flex items-center gap-2">
        {numero && (
          <span className={`font-mono text-xs font-semibold tracking-widest uppercase ${colorTextoTag}`}>
            // {numero}
          </span>
        )}
        <h3 className="font-display text-base font-semibold text-[#E6EDF7] tracking-tight">
          {titulo}
        </h3>
      </div>
      {descripcion && (
        <p className="text-xs text-[#8A97B1] mt-0.5 font-sans leading-relaxed">
          {descripcion}
        </p>
      )}
    </div>
  );
};
