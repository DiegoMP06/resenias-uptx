import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Eye, EyeOff, ShieldAlert, Save, Server, Key, Smartphone, Wifi } from 'lucide-react-native';

import {
  Pantalla,
  Boton,
  Campo,
  Tarjeta,
  EncabezadoSeccion,
} from '@/components/blueprint';
import { repositorio } from '@/db/repositorio';

export default function AjustesScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const [syncToken, setSyncToken] = useState('');
  const [fuente, setFuente] = useState('app-1');
  const [syncAuto, setSyncAuto] = useState(false);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const aj = await repositorio.obtenerAjustes();
        setApiUrl(aj.api_url || '');
        setSyncToken(aj.sync_token || '');
        setFuente(aj.fuente || 'app-1');
        setSyncAuto(aj.sync_auto === '1');
      } catch (err) {
        console.error('Error al cargar ajustes:', err);
      }
    }
    cargar();
  }, []);

  const guardar = async () => {
    setGuardando(true);
    try {
      await repositorio.guardarAjuste('api_url', apiUrl.trim());
      await repositorio.guardarAjuste('sync_token', syncToken.trim());
      await repositorio.guardarAjuste('fuente', fuente.trim() || 'app-1');
      await repositorio.guardarAjuste('sync_auto', syncAuto ? '1' : '0');

      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3000);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron guardar los ajustes.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pantalla conSafeArea={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Advertencia de Seguridad */}
          <View className="bg-[#FFB020]/10 border border-[#FFB020]/40 rounded-[6px] p-3 mb-4 flex-row items-start gap-3">
            <ShieldAlert size={20} color="#FFB020" className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-xs font-mono font-bold text-[#FFB020] uppercase mb-1">
                Aviso de Seguridad
              </Text>
              <Text className="text-xs text-[#E6EDF7] leading-relaxed">
                No compartas capturas de pantalla de esta sección. El token de sincronización da acceso a la API del servidor.
              </Text>
            </View>
          </View>

          {/* Formulario de Configuración */}
          <Tarjeta className="mb-4">
            <EncabezadoSeccion
              titulo="Configuración del Servidor"
              descripcion="Parámetros para sincronización remota"
            />

            {/* URL del API */}
            <Campo
              label="URL del Servidor (API)"
              ayuda="Ej: https://tudominio.vercel.app"
            >
              <View className="flex-row items-center bg-[#0A0F1A] border border-[#243049] rounded-[6px] px-3">
                <Server size={16} color="#8CA0BA" className="mr-2" />
                <TextInput
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  placeholder="https://tudominio.vercel.app"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  className="flex-1 py-2.5 text-xs text-[#E6EDF7] font-mono"
                />
              </View>
            </Campo>

            {/* SYNC_TOKEN con Ojo */}
            <Campo
              label="Token de Sincronización (SYNC_TOKEN)"
              ayuda="Secreto compartido con el backend"
            >
              <View className="flex-row items-center bg-[#0A0F1A] border border-[#243049] rounded-[6px] px-3">
                <Key size={16} color="#8CA0BA" className="mr-2" />
                <TextInput
                  value={syncToken}
                  onChangeText={setSyncToken}
                  placeholder="Introduce el SYNC_TOKEN"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!mostrarToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 py-2.5 text-xs text-[#E6EDF7] font-mono"
                />
                <Pressable
                  onPress={() => setMostrarToken(!mostrarToken)}
                  className="p-1.5"
                  accessibilityLabel="Mostrar u ocultar token"
                >
                  {mostrarToken ? (
                    <EyeOff size={16} color="#22D3EE" />
                  ) : (
                    <Eye size={16} color="#8CA0BA" />
                  )}
                </Pressable>
              </View>
            </Campo>

            {/* Identificador de Fuente / Dispositivo */}
            <Campo
              label="ID de Encuestador / Dispositivo (fuente)"
              ayuda="Ej: app-1, brigada-norte"
            >
              <View className="flex-row items-center bg-[#0A0F1A] border border-[#243049] rounded-[6px] px-3">
                <Smartphone size={16} color="#8CA0BA" className="mr-2" />
                <TextInput
                  value={fuente}
                  onChangeText={setFuente}
                  placeholder="app-1"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 py-2.5 text-xs text-[#E6EDF7] font-mono"
                />
              </View>
            </Campo>

            {/* Switch de Auto-Sincronización */}
            <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-[#1A2336]">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                  <Wifi size={14} color="#22D3EE" />
                  <Text className="text-xs font-mono font-bold text-[#E6EDF7]">
                    Sincronización Automática
                  </Text>
                </View>
                <Text className="text-[11px] font-mono text-[#8CA0BA]">
                  Intentar enviar lotes al detectar conexión a internet
                </Text>
              </View>
              <Switch
                value={syncAuto}
                onValueChange={setSyncAuto}
                trackColor={{ false: '#1A2336', true: '#22D3EE' }}
                thumbColor={syncAuto ? '#0A0F1A' : '#8CA0BA'}
              />
            </View>
          </Tarjeta>

          {/* Notificación de guardado */}
          {mensajeExito && (
            <View className="bg-[#34D399]/10 border border-[#34D399]/40 rounded-[6px] p-2.5 mb-4">
              <Text className="text-xs font-mono text-[#34D399] text-center font-bold">
                ✓ Ajustes guardados correctamente en SQLite local.
              </Text>
            </View>
          )}

          {/* Botón Guardar */}
          <Boton
            variante="primario"
            tamano="md"
            icono={<Save size={16} color="#04121A" />}
            onPress={guardar}
            disabled={guardando}
          >
            {guardando ? 'GUARDANDO...' : 'GUARDAR AJUSTES'}
          </Boton>

          {/* Información del Sistema */}
          <View className="mt-8 pt-4 border-t border-[#1A2336] items-center">
            <Text className="text-[10px] font-mono text-[#64748B]">
              VOZ POLITÉCNICA · EXPO CLIENTE OFFLINE
            </Text>
            <Text className="text-[10px] font-mono text-[#64748B] mt-0.5">
              SQLite v1 (WAL) · Contratos sincronizados
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}
