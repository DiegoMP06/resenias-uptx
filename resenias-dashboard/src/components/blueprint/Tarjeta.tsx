import React from 'react';

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
    <div
      className={`relative bg-[#111827] border border-[#243049] rounded-[6px] p-5 shadow-lg shadow-black/40 ${className}`}
    >
      {conMarcasRegistro && (
        <>
          {/* Esquina superior izquierda */}
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#22D3EE] pointer-events-none -mt-px -ml-px rounded-tl-[2px]" />
          {/* Esquina superior derecha */}
          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#22D3EE] pointer-events-none -mt-px -mr-px rounded-tr-[2px]" />
          {/* Esquina inferior izquierda */}
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#22D3EE] pointer-events-none -mb-px -ml-px rounded-bl-[2px]" />
          {/* Esquina inferior derecha */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#22D3EE] pointer-events-none -mb-px -mr-px rounded-br-[2px]" />
        </>
      )}
      {children}
    </div>
  );
};
