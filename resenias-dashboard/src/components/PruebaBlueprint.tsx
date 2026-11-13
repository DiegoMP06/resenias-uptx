import React, { useState } from 'react';
import {
  Pantalla,
  Tarjeta,
  Boton,
  Campo,
  EncabezadoSeccion,
  Chip,
} from './blueprint';
import { Factory, Cpu, Gauge, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PruebaBlueprint: React.FC = () => {
  const [contador, setContador] = useState(0);
  const [textoPrueba, setTextoPrueba] = useState('');

  const PALETA = [
    { nombre: 'bg', hex: '#0A0F1A', rol: 'Fondo base' },
    { nombre: 'surface', hex: '#111827', rol: 'Tarjetas' },
    { nombre: 'surface2', hex: '#1A2336', rol: 'Campos y elevación' },
    { nombre: 'line', hex: '#243049', rol: 'Bordes / cuadrícula' },
    { nombre: 'text', hex: '#E6EDF7', rol: 'Texto principal' },
    { nombre: 'muted', hex: '#8A97B1', rol: 'Secundario' },
    { nombre: 'cyan', hex: '#22D3EE', rol: 'Acción TI / datos' },
    { nombre: 'amber', hex: '#FFB020', rol: 'Industrial / alerta' },
    { nombre: 'ok', hex: '#34D399', rol: 'Enviado / éxito' },
    { nombre: 'danger', hex: '#F87171', rol: 'Error' },
  ];

  return (
    <Pantalla className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Encabezado con glifo técnico */}
      <header className="mb-8 border-b border-[#243049] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#111827] border border-[#22D3EE] flex items-center justify-center text-[#22D3EE] shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Factory className="w-5 h-5 text-[#FFB020]" />
            </div>
            <div>
              <span className="font-mono text-[11px] tracking-widest uppercase text-[#22D3EE]">
                UPTLAX · MINERÍA DE TEXTOS 7C
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#E6EDF7]">
                Fundación Blueprint Industrial-Tech
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip estado="info" texto="FASE 1 ACTIVA" />
            <Chip estado="enviado" texto="DASHBOARD OK" />
          </div>
        </div>

        {/* Cinta de seguridad de acento */}
        <div className="cinta-seguridad mt-6 rounded-[2px]" />
      </header>

      <div className="space-y-8">
        {/* SECCIÓN 1: PALETA DE COLORES */}
        <Tarjeta>
          <EncabezadoSeccion
            numero="01"
            titulo="Tokens de Color del Sistema"
            descripcion="Mapeo idéntico entre web (Astro) y app (Expo NativeWind)."
          />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            {PALETA.map((color) => (
              <div
                key={color.nombre}
                className="p-3 rounded-[6px] border border-[#243049] bg-[#1A2336] flex flex-col gap-1.5"
              >
                <div
                  className="w-full h-8 rounded-[4px] border border-black/30"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-mono text-xs font-semibold text-[#E6EDF7]">
                    {color.nombre}
                  </span>
                  <span className="font-mono text-[10px] text-[#8A97B1]">
                    {color.hex}
                  </span>
                </div>
                <span className="text-[11px] text-[#8A97B1] truncate">{color.rol}</span>
              </div>
            ))}
          </div>
        </Tarjeta>

        {/* SECCIÓN 2: TIPOGRAFÍAS */}
        <Tarjeta>
          <EncabezadoSeccion
            numero="02"
            titulo="Jerarquía Tipográfica"
            descripcion="Space Grotesk para títulos, Inter para lectura y JetBrains Mono para telemetría/folios."
            color="amber"
          />
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-[#1A2336] rounded-[6px] border border-[#243049]">
              <span className="font-mono text-[11px] text-[#22D3EE] uppercase tracking-wider block mb-1">
                Display · Space Grotesk (600 / 700)
              </span>
              <p className="font-display text-xl sm:text-2xl font-bold text-[#E6EDF7]">
                Pertinencia de la Formación Académica · UPTlax 2026
              </p>
            </div>

            <div className="p-3 bg-[#1A2336] rounded-[6px] border border-[#243049]">
              <span className="font-mono text-[11px] text-[#8A97B1] uppercase tracking-wider block mb-1">
                Lectura · Inter (400 / 500)
              </span>
              <p className="font-sans text-sm text-[#E6EDF7] leading-relaxed">
                Herramienta académica para recolectar respuestas abiertas sobre la relación entre el plan de estudios y la demanda laboral en la industria.
              </p>
            </div>

            <div className="p-3 bg-[#1A2336] rounded-[6px] border border-[#243049]">
              <span className="font-mono text-[11px] text-[#FFB020] uppercase tracking-wider block mb-1">
                Técnico · JetBrains Mono (400 / 500)
              </span>
              <p className="font-mono text-xs sm:text-sm text-[#E6EDF7]">
                ID: 4f9b2c8a-7e1d-4033-9fa0-c09a8bc43d12 · FOLIO: R001 · STATUS: OK · SYNC: PENDING
              </p>
            </div>
          </div>
        </Tarjeta>

        {/* SECCIÓN 3: COMPONENTES BASE */}
        <Tarjeta>
          <EncabezadoSeccion
            numero="03"
            titulo="Componentes Base Blueprint"
            descripcion="Misma nomenclatura, props y comportamiento en web y app."
          />

          <div className="space-y-6 mt-4">
            {/* Chips de estado */}
            <div>
              <span className="font-mono text-xs text-[#8A97B1] uppercase tracking-wider block mb-2">
                // Estados de máquina (Chips)
              </span>
              <div className="flex flex-wrap gap-2.5">
                <Chip estado="pendiente" />
                <Chip estado="enviado" />
                <Chip estado="error" />
                <Chip estado="info" />
              </div>
            </div>

            {/* Botones */}
            <div>
              <span className="font-mono text-xs text-[#8A97B1] uppercase tracking-wider block mb-2">
                // Botones interactivos (≥ 44px touch target)
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Boton
                  variante="primario"
                  icono={<Gauge className="w-4 h-4" />}
                  onClick={() => setContador(contador + 1)}
                >
                  Pulsos técnicos: {contador}
                </Boton>

                <Boton
                  variante="secundario"
                  icono={<Cpu className="w-4 h-4" />}
                  onClick={() => setContador(0)}
                >
                  Reiniciar
                </Boton>

                <Boton
                  variante="peligro"
                  icono={<AlertTriangle className="w-4 h-4" />}
                >
                  Acción crítica
                </Boton>
              </div>
            </div>

            {/* Campos de formulario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo
                label="Identificador de estación"
                ayuda="Solo lectura"
                id="campo-estacion"
              >
                <input
                  id="campo-estacion"
                  type="text"
                  readOnly
                  value="STATION-WEB-SRV-01"
                  className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] px-3.5 py-2.5 text-sm font-mono text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/20 transition-all"
                />
              </Campo>

              <Campo
                label="Entrada interactiva"
                error={textoPrueba.length < 5 && textoPrueba.length > 0 ? 'Mínimo 5 caracteres para calibración' : undefined}
                requerido
                id="campo-test"
              >
                <input
                  id="campo-test"
                  type="text"
                  placeholder="Escribe algo aquí..."
                  value={textoPrueba}
                  onChange={(e) => setTextoPrueba(e.target.value)}
                  className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] px-3.5 py-2.5 text-sm font-sans text-[#E6EDF7] placeholder-[#8A97B1]/50 focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/20 transition-all"
                />
              </Campo>
            </div>
          </div>
        </Tarjeta>
      </div>

      <footer className="mt-8 pt-4 border-t border-[#243049] text-center font-mono text-xs text-[#8A97B1]">
        Sistema Blueprint Industrial-Tech · Fase 1 (Fundación) · UPTlax Minería de Textos
      </footer>
    </Pantalla>
  );
};
