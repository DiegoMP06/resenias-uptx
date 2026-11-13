import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Trash2, X, AlertCircle } from 'lucide-react-native';

import {
  Pantalla,
  Chip,
  Boton,
  type EstadoChip,
} from '@/components/blueprint';
import {
  CARRERAS,
  etiquetaCarrera,
  etiquetaTsu,
  type Carrera,
} from '@/shared/carreras';
import {
  repositorio,
  type RegistroLocal,
  type EstadoRegistro,
} from '@/db/repositorio';

export default function RegistrosScreen() {
  const [registros, setRegistros] = useState<RegistroLocal[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoRegistro | 'todos'>('todos');
  const [filtroCarrera, setFiltroCarrera] = useState<string | 'todas'>('todas');
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroLocal | null>(null);

  const cargarRegistros = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await repositorio.listar({
        estado: filtroEstado === 'todos' ? undefined : filtroEstado,
        carrera: filtroCarrera === 'todas' ? undefined : filtroCarrera,
      });
      setRegistros(datos);
    } catch (err) {
      console.error('Error al listar registros:', err);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado, filtroCarrera]);

  useFocusEffect(
    useCallback(() => {
      cargarRegistros();
    }, [cargarRegistros])
  );

  const confirmarBorrado = (reg: RegistroLocal) => {
    if (reg.estado !== 'pendiente') {
      Alert.alert(
        'Acción no permitida',
        'Solo se pueden eliminar registros con estado PENDIENTE. Los registros sincronizados se preservan permanentemente.'
      );
      return;
    }

    Alert.alert(
      'Eliminar registro local',
      `¿Estás seguro de eliminar este registro pendiente (${etiquetaCarrera(reg.carrera)}, Cuat. ${reg.cuatrimestre})? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await repositorio.borrarPendiente(reg.id);
              setRegistroSeleccionado(null);
              cargarRegistros();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el registro local.');
            }
          },
        },
      ]
    );
  };

  const formatearFecha = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <Pantalla conSafeArea={false}>
      <View className="flex-1 px-4 py-3">
        {/* Filtros de Estado */}
        <View className="flex-row items-center gap-1.5 mb-2">
          {(['todos', 'pendiente', 'enviado', 'error'] as const).map((est) => {
            const activo = filtroEstado === est;
            const labels: Record<string, string> = {
              todos: 'TODOS',
              pendiente: 'PENDIENTES',
              enviado: 'ENVIADOS',
              error: 'ERRORES',
            };
            return (
              <Pressable
                key={est}
                onPress={() => setFiltroEstado(est)}
                className={`px-2.5 py-1.5 rounded-[4px] border ${
                  activo
                    ? 'bg-[#22D3EE] border-[#22D3EE]'
                    : 'bg-[#1A2336] border-[#243049]'
                }`}
              >
                <Text
                  className={`text-[11px] font-mono font-bold ${
                    activo ? 'text-[#0A0F1A]' : 'text-[#8CA0BA]'
                  }`}
                >
                  {labels[est]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Filtro horizontal de carreras */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-1.5 mb-3 pb-1"
        >
          <Pressable
            onPress={() => setFiltroCarrera('todas')}
            className={`px-2 py-1 rounded-[4px] border mr-1.5 ${
              filtroCarrera === 'todas'
                ? 'bg-[#111827] border-[#22D3EE]'
                : 'bg-[#0A0F1A] border-[#243049]'
            }`}
          >
            <Text
              className={`text-[10px] font-mono ${
                filtroCarrera === 'todas' ? 'text-[#22D3EE] font-bold' : 'text-[#8CA0BA]'
              }`}
            >
              TODAS LAS CARRERAS
            </Text>
          </Pressable>
          {CARRERAS.map((c: Carrera) => (
            <Pressable
              key={c.id}
              onPress={() => setFiltroCarrera(c.id)}
              className={`px-2 py-1 rounded-[4px] border mr-1.5 ${
                filtroCarrera === c.id
                  ? 'bg-[#111827] border-[#22D3EE]'
                  : 'bg-[#0A0F1A] border-[#243049]'
              }`}
            >
              <Text
                className={`text-[10px] font-mono ${
                  filtroCarrera === c.id ? 'text-[#22D3EE] font-bold' : 'text-[#8CA0BA]'
                }`}
              >
                {c.corta}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Conteo de resultados */}
        <View className="flex-row items-center justify-between mb-2 px-1">
          <Text className="text-[11px] font-mono text-[#8CA0BA]">
            {registros.length} registro(s) encontrado(s)
          </Text>
        </View>

        {/* Lista de Registros */}
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={cargando}
              onRefresh={cargarRegistros}
              tintColor="#22D3EE"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16 bg-[#111827] rounded-[6px] border border-[#243049] mt-4">
              <AlertCircle size={32} color="#8CA0BA" />
              <Text className="text-sm font-mono text-[#E6EDF7] mt-3 font-semibold">
                Sin registros locales
              </Text>
              <Text className="text-xs font-mono text-[#8CA0BA] text-center mt-1 px-6">
                {filtroEstado !== 'todos' || filtroCarrera !== 'todas'
                  ? 'No hay registros que coincidan con los filtros seleccionados.'
                  : 'Aún no has capturado ninguna respuesta en este dispositivo.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const nombreCarrera = etiquetaCarrera(item.carrera);
            const nombreTsu = item.tsu ? etiquetaTsu(item.tsu) : null;

            return (
              <Pressable
                onPress={() => setRegistroSeleccionado(item)}
                className="bg-[#111827] border border-[#243049] rounded-[6px] p-3 mb-2 active:border-[#22D3EE]"
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                    <Text className="text-xs font-mono font-bold text-[#E6EDF7]" numberOfLines={1}>
                      {nombreCarrera}
                    </Text>
                    {nombreTsu && (
                      <Text className="text-[10px] font-mono text-[#FFB020]">
                        [{item.tsu}]
                      </Text>
                    )}
                    <Text className="text-[10px] font-mono text-[#8CA0BA]">
                      · Cuat. {item.cuatrimestre}
                    </Text>
                  </View>
                  <Chip estado={item.estado as EstadoChip} />
                </View>

                {/* Fragmento de respuesta */}
                <Text
                  className="text-xs font-mono text-[#8CA0BA] leading-relaxed mb-2"
                  numberOfLines={2}
                >
                  "{item.respuesta}"
                </Text>

                <View className="flex-row items-center justify-between pt-1.5 border-t border-[#1A2336]">
                  <Text className="text-[10px] font-mono text-[#64748B]">
                    ID: {item.id.slice(0, 8)}...
                  </Text>
                  <Text className="text-[10px] font-mono text-[#64748B]">
                    {formatearFecha(item.creado_en)}
                  </Text>
                </View>

                {item.error && (
                  <View className="mt-1.5 bg-[#F87171]/10 border border-[#F87171]/30 p-1.5 rounded">
                    <Text className="text-[10px] font-mono text-[#F87171]">
                      Error: {item.error}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      {/* Modal de Detalle */}
      <Modal
        visible={Boolean(registroSeleccionado)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRegistroSeleccionado(null)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-[#111827] border-t border-[#243049] rounded-t-[12px] p-5 max-h-[85%]">
            {registroSeleccionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cabecera del modal */}
                <View className="flex-row items-center justify-between pb-3 border-b border-[#243049] mb-4">
                  <View className="flex-row items-center gap-2">
                    <Chip estado={registroSeleccionado.estado as EstadoChip} />
                    <Text className="text-xs font-mono text-[#8CA0BA]">
                      ID: {registroSeleccionado.id.slice(0, 8)}...
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setRegistroSeleccionado(null)}
                    className="w-8 h-8 rounded-full bg-[#1A2336] items-center justify-center"
                  >
                    <X size={16} color="#E6EDF7" />
                  </Pressable>
                </View>

                {/* Metadatos */}
                <View className="bg-[#0A0F1A] border border-[#243049] p-3 rounded-[6px] mb-4 space-y-1.5">
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-mono text-[#8CA0BA]">Carrera:</Text>
                    <Text className="text-xs font-mono font-bold text-[#E6EDF7]">
                      {etiquetaCarrera(registroSeleccionado.carrera)}
                    </Text>
                  </View>
                  {registroSeleccionado.tsu && (
                    <View className="flex-row justify-between">
                      <Text className="text-xs font-mono text-[#8CA0BA]">TSU / Especialidad:</Text>
                      <Text className="text-xs font-mono text-[#FFB020]">
                        {etiquetaTsu(registroSeleccionado.tsu)} ({registroSeleccionado.tsu})
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-mono text-[#8CA0BA]">Cuatrimestre:</Text>
                    <Text className="text-xs font-mono text-[#E6EDF7]">
                      {registroSeleccionado.cuatrimestre}°
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-mono text-[#8CA0BA]">Fuente:</Text>
                    <Text className="text-xs font-mono text-[#22D3EE]">
                      {registroSeleccionado.fuente}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-mono text-[#8CA0BA]">Fecha de captura:</Text>
                    <Text className="text-xs font-mono text-[#E6EDF7]">
                      {formatearFecha(registroSeleccionado.creado_en)}
                    </Text>
                  </View>
                  {registroSeleccionado.enviado_en && (
                    <View className="flex-row justify-between">
                      <Text className="text-xs font-mono text-[#8CA0BA]">Sincronizado en:</Text>
                      <Text className="text-xs font-mono text-[#34D399]">
                        {formatearFecha(registroSeleccionado.enviado_en)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Texto completo de respuesta */}
                <Text className="text-xs font-mono text-[#8CA0BA] uppercase mb-1.5">
                  Respuesta abierta ({registroSeleccionado.respuesta.length} caracteres):
                </Text>
                <View className="bg-[#0A0F1A] border border-[#243049] p-3.5 rounded-[6px] mb-4">
                  <Text className="text-sm font-mono text-[#E6EDF7] leading-relaxed">
                    {registroSeleccionado.respuesta}
                  </Text>
                </View>

                {/* Error si existe */}
                {registroSeleccionado.error && (
                  <View className="bg-[#F87171]/10 border border-[#F87171]/40 p-3 rounded-[6px] mb-4">
                    <Text className="text-xs font-mono text-[#F87171] font-bold mb-1">
                      Último error de sincronización:
                    </Text>
                    <Text className="text-xs font-mono text-[#F87171]">
                      {registroSeleccionado.error}
                    </Text>
                  </View>
                )}

                {/* Botón de borrar (solo pendiente) */}
                {registroSeleccionado.estado === 'pendiente' ? (
                  <Boton
                    variante="peligro"
                    icono={<Trash2 size={16} color="#F87171" />}
                    onPress={() => confirmarBorrado(registroSeleccionado)}
                  >
                    ELIMINAR REGISTRO PENDIENTE
                  </Boton>
                ) : (
                  <View className="bg-[#1A2336] p-2.5 rounded-[6px] border border-[#243049]">
                    <Text className="text-center text-xs font-mono text-[#8CA0BA]">
                      Registro sincronizado. No se puede eliminar localmente.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Pantalla>
  );
}
