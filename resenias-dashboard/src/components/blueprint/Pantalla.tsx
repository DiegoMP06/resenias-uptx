import React from 'react';

interface PantallaProps {
  children: React.ReactNode;
  className?: string;
  conRejilla?: boolean;
}

export const Pantalla: React.FC<PantallaProps> = ({
  children,
  className = '',
  conRejilla = true,
}) => {
  return (
    <div
      className={`min-h-screen w-full bg-[#0A0F1A] text-[#E6EDF7] font-sans relative overflow-x-hidden ${
        conRejilla ? 'bg-grid-blueprint' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
