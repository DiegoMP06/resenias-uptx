import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import {
  Pantalla,
  Tarjeta,
  Boton,
  Campo,
  EncabezadoSeccion,
  Chip,
} from '@/components/blueprint';
import { Factory, Cpu, Gauge, AlertTriangle } from 'lucide-react-native';

export default function HomeScreen() {
  const [contador, setContador] = useState(0);
  const [textoPrueba, setTextoPrueba] = useState('');

  const PALETA = [
    { nombre: 'bg', hex: '#0A0F1A' },
    { nombre: 'surface', hex: '#111827' },
    { nombre: 'surface2', hex: '#1A2336' },
    { nombre: 'line', hex: '#243049' },
    { nombre: 'text', hex: '#E6EDF7' },
    { nombre: 'muted', hex: '#8A97B1' },
    { nombre: 'cyan', hex: '#22D3EE' },
    { nombre: 'amber', hex: '#FFB020' },
    { nombre: 'ok', hex: '#34D399' },
    { nombre: 'danger', hex: '#F87171' },
  ];

  return (
    <Pantalla>
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View className="mb-6 border-b border-[#243049] pb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-[6px] bg-[#111827] border border-[#22D3EE] items-center justify-center">
              <Factory size={20} color="#FFB020" />
            </View>
            <View className="flex-1">
              <Text className="font-mono text-[10px] tracking-widest uppercase text-[#22D3EE]">
                UPTLAX · MINERÍA DE TEXTOS 7C
              </Text>
              <Text className="text-xl font-bold text-[#E6EDF7] tracking-tight">
                Blueprint Industrial-Tech
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 mt-3">
            <Chip estado="info" texto="APP FASE 1" />
            <Chip estado="enviado" texto="NATIVEWIND OK" />
          </View>
        </View>

        {/* Sección 1: Paleta */}
        <Tarjeta className="mb-4">
          <EncabezadoSeccion
            numero="01"
            titulo="Tokens de Color"
            descripcion="Misma paleta y valores hex que la versión web."
          />
          <View className="flex-row flex-wrap gap-2 mt-3">
            {PALETA.map((color) => (
              <View
                key={color.nombre}
                className="p-2 rounded-[4px] border border-[#243049] bg-[#1A2336] w-[47%]"
              >
                <View
                  className="w-full h-6 rounded-[2px]"
                  style={{ backgroundColor: color.hex }}
                />
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="font-mono text-xs font-semibold text-[#E6EDF7]">
                    {color.nombre}
                  </Text>
                  <Text className="font-mono text-[10px] text-[#8A97B1]">
                    {color.hex}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Tarjeta>

        {/* Sección 2: Tipografías */}
        <Tarjeta className="mb-4">
          <EncabezadoSeccion
            numero="02"
            titulo="Jerarquía Tipográfica"
            descripcion="Space Grotesk, Inter y JetBrains Mono."
            color="amber"
          />
          <View className="gap-2.5 mt-3">
            <View className="p-3 bg-[#1A2336] rounded-[6px] border border-[#243049]">
              <Text className="font-mono text-[10px] text-[#22D3EE] uppercase tracking-wider mb-1">
                Display · Space Grotesk
              </Text>
              <Text className="text-base font-bold text-[#E6EDF7]">
                Pertinencia de la Formación Académica
              </Text>
            </View>

            <View className="p-3 bg-[#1A2336] rounded-[6px] border border-[#243049]">
              <Text className="font-mono text-[10px] text-[#8A97B1] uppercase tracking-wider mb-1">
                Lectura · Inter
              </Text>
              <Text className="text-xs text-[#E6EDF7] leading-relaxed">
                Herramienta académica de recolección de respuestas abiertas para estudiantes de UPTlax.
              </Text>
            </View>

            <View className="p-3 bg-[#1A2336] rounded-[6px] border border-[#243049]">
              <Text className="font-mono text-[10px] text-[#FFB020] uppercase tracking-wider mb-1">
                Técnico · JetBrains Mono
              </Text>
              <Text className="font-mono text-[11px] text-[#E6EDF7]">
                UUID: b7e24a10-2c70-4f8e · SQLite OK
              </Text>
            </View>
          </View>
        </Tarjeta>

        {/* Sección 3: Componentes base */}
        <Tarjeta className="mb-4">
          <EncabezadoSeccion
            numero="03"
            titulo="Componentes Base"
            descripcion="Misma API de componentes que en la web."
          />

          <View className="mt-3 gap-3">
            {/* Chips */}
            <View className="flex-row flex-wrap gap-2">
              <Chip estado="pendiente" />
              <Chip estado="enviado" />
              <Chip estado="error" />
              <Chip estado="info" />
            </View>

            {/* Botones */}
            <View className="gap-2 mt-2">
              <Boton
                variante="primario"
                icono={<Gauge size={16} color="#04121A" />}
                onPress={() => setContador(contador + 1)}
              >
                {`Pulsos técnicos: ${contador}`}
              </Boton>

              <Boton
                variante="secundario"
                icono={<Cpu size={16} color="#E6EDF7" />}
                onPress={() => setContador(0)}
              >
                Reiniciar contador
              </Boton>

              <Boton
                variante="peligro"
                icono={<AlertTriangle size={16} color="#F87171" />}
              >
                Acción crítica
              </Boton>
            </View>

            {/* Campos */}
            <Campo label="Estación local" ayuda="Solo lectura">
              <TextInput
                value="STATION-EXPO-APP-01"
                editable={false}
                className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] px-3 py-2 text-xs font-mono text-[#E6EDF7]"
              />
            </Campo>

            <Campo
              label="Entrada de prueba"
              error={
                textoPrueba.length < 5 && textoPrueba.length > 0
                  ? 'Mínimo 5 caracteres para calibración'
                  : undefined
              }
              requerido
            >
              <TextInput
                placeholder="Escribe algo aquí..."
                placeholderTextColor="#8A97B1"
                value={textoPrueba}
                onChangeText={setTextoPrueba}
                className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] px-3 py-2 text-xs font-sans text-[#E6EDF7]"
              />
            </Campo>
          </View>
        </Tarjeta>

        <Text className="text-center font-mono text-[11px] text-[#8A97B1] mt-4">
          Sistema Blueprint Industrial-Tech · Fase 1 · Expo App
        </Text>
      </ScrollView>
    </Pantalla>
  );
}
