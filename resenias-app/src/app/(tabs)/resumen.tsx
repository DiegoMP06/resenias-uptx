import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Database, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react-native';

import {
  Pantalla,
  Tarjeta,
  EncabezadoSeccion,
  MedidorSegmentado,
} from '@/components/blueprint';
import {
  CARRERAS,
  TSU_OPCIONES,
  type Carrera,
} from '@/shared/carreras';
import {
  repositorio,
  type ConteoEstado,
} from '@/db/repositorio';

export default function ResumenScreen() {
  const [cargando, setCargando] = useState(false);
  const [estados, setEstados] = useState<ConteoEstado>({
    total: 0,
    pendientes: 0,
    enviados: 0,
    errores: 0,
  });
  const [conteoCarreras, setConteoCarreras] = useState<Record<string, number>>({});
  const [conteoTsu, setConteoTsu] = useState<Record<string, number>>({});

  const cargarMetricas = useCallback(async () => {
    setCargando(true);
    try {
      const [est, car, tsu] = await Promise.all([
        repositorio.contarPorEstado(),
        repositorio.contarPorCarrera(),
        repositorio.contarPorTsu(),
      ]);
      setEstados(est);

      // Convertir array ConteoCarrera[] a objeto map
      const carMap: Record<string, number> = {};
      for (const item of car) {
        carMap[item.carrera] = item.total;
      }
      setConteoCarreras(carMap);

      // Convertir array ConteoTsu[] a objeto map
      const tsuMap: Record<string, number> = {};
      for (const item of tsu) {
        tsuMap[item.tsu] = item.total;
      }
      setConteoTsu(tsuMap);
    } catch (err) {
      console.error('Error al cargar métricas de SQLite:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarMetricas();
    }, [cargarMetricas])
  );

  return (
    <Pantalla conSafeArea={false}>
      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargarMetricas}
            tintColor="#22D3EE"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <EncabezadoSeccion
          titulo="Métricas Locales"
          descripcion="Almacenadas en SQLite en este dispositivo"
        />

        {/* Tarjetas KPI de Estado */}
        <View className="grid grid-cols-2 gap-2 mb-4 flex-row flex-wrap">
          {/* Total */}
          <View className="w-[48%] bg-[#111827] border border-[#243049] rounded-[6px] p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px] font-mono uppercase text-[#8CA0BA]">
                Total Capturadas
              </Text>
              <Database size={14} color="#22D3EE" />
            </View>
            <Text className="text-2xl font-mono font-bold text-[#22D3EE]">
              {estados.total}
            </Text>
          </View>

          {/* Pendientes */}
          <View className="w-[48%] bg-[#111827] border border-[#243049] rounded-[6px] p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px] font-mono uppercase text-[#8CA0BA]">
                Por Sincronizar
              </Text>
              <Clock size={14} color="#FFB020" />
            </View>
            <Text className="text-2xl font-mono font-bold text-[#FFB020]">
              {estados.pendientes}
            </Text>
          </View>

          {/* Enviadas */}
          <View className="w-[48%] bg-[#111827] border border-[#243049] rounded-[6px] p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px] font-mono uppercase text-[#8CA0BA]">
                Enviadas al Servidor
              </Text>
              <CheckCircle2 size={14} color="#34D399" />
            </View>
            <Text className="text-2xl font-mono font-bold text-[#34D399]">
              {estados.enviados}
            </Text>
          </View>

          {/* Errores */}
          <View className="w-[48%] bg-[#111827] border border-[#243049] rounded-[6px] p-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px] font-mono uppercase text-[#8CA0BA]">
                Con Error
              </Text>
              <AlertTriangle size={14} color="#F87171" />
            </View>
            <Text className="text-2xl font-mono font-bold text-[#F87171]">
              {estados.errores}
            </Text>
          </View>
        </View>

        {/* Metas Prioritarias */}
        <Tarjeta className="mb-4">
          <EncabezadoSeccion
            titulo="Avance vs. Metas Oficiales"
            descripcion="Seguimiento de cuotas académicas"
          />

          <View className="space-y-4">
            {CARRERAS.map((c: Carrera) => {
              const capturados = conteoCarreras[c.id] || 0;
              return (
                <View key={c.id} className="border-b border-[#1A2336] pb-3 last:border-b-0">
                  <MedidorSegmentado
                    valor={capturados}
                    meta={c.meta}
                    etiqueta={c.etiqueta}
                    subtitulo={c.meta > 0 ? `Meta proyecto: ${c.meta} respuestas` : 'Sin cuota fija'}
                  />
                </View>
              );
            })}
          </View>
        </Tarjeta>

        {/* Desglose por TSU (Ingeniería en TI) */}
        <Tarjeta className="mb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Layers size={16} color="#FFB020" />
            <Text className="text-xs font-mono font-bold text-[#FFB020] uppercase tracking-wider">
              Desglose TSU / Especialidad (TI)
            </Text>
          </View>
          <Text className="text-xs text-[#8CA0BA] mb-3">
            Distribución de las respuestas capturadas en Ingeniería en Tecnologías de la Información:
          </Text>

          <View className="space-y-2">
            {TSU_OPCIONES.map((t) => {
              const capturados = conteoTsu[t.id] || 0;
              return (
                <View
                  key={t.id}
                  className="bg-[#1A2336] border border-[#243049] p-2.5 rounded-[6px] flex-row items-center justify-between"
                >
                  <View>
                    <Text className="text-xs font-mono font-bold text-[#E6EDF7]">
                      {t.etiqueta}
                    </Text>
                    <Text className="text-[10px] font-mono text-[#8CA0BA]">
                      Especialidad: [{t.id}]
                    </Text>
                  </View>
                  <Text className="text-base font-mono font-bold text-[#22D3EE]">
                    {capturados}
                  </Text>
                </View>
              );
            })}
          </View>
        </Tarjeta>
      </ScrollView>
    </Pantalla>
  );
}
