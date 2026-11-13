import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Crypto from 'expo-crypto';
import { CheckCircle2, ShieldCheck } from 'lucide-react-native';

import {
  Pantalla,
  Boton,
  Campo,
  Tarjeta,
  EncabezadoSeccion,
} from '@/components/blueprint';
import {
  CARRERAS,
  TSU_OPCIONES,
  CUATRIMESTRES,
  carreraPideTsu,
  type Carrera,
} from '@/shared/carreras';
import {
  PREGUNTA_OFICIAL,
  TEXTO_CONSENTIMIENTO,
  ETIQUETA_CONSENTIMIENTO,
} from '@/shared/pregunta';
import {
  formularioSchema,
  formularioARegistro,
  MIN_RESPUESTA,
  MAX_RESPUESTA,
  type FormularioValores,
} from '@/shared/schema';
import { repositorio } from '@/db/repositorio';

export default function CapturarScreen() {
  const [agradecimiento, setAgradecimiento] = useState(false);
  const [totalLocales, setTotalLocales] = useState(0);
  const [fuenteActual, setFuenteActual] = useState('app-1');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormularioValores>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      consentimiento: false,
      carrera: '',
      tsu: '',
      cuatrimestre: '',
      respuesta: '',
    },
  });

  const carreraSeleccionada = watch('carrera');
  const respuestaActual = watch('respuesta') || '';
  const pideTsu = carreraPideTsu(carreraSeleccionada);

  useEffect(() => {
    async function cargarAjustes() {
      try {
        const ajustes = await repositorio.obtenerAjustes();
        if (ajustes.fuente) {
          setFuenteActual(ajustes.fuente);
        }
        const conteos = await repositorio.contarPorEstado();
        setTotalLocales(conteos.total);
      } catch (err) {
        console.warn('Error al cargar ajustes iniciales:', err);
      }
    }
    cargarAjustes();
  }, [agradecimiento]);

  // Si cambia la carrera y no pide TSU, limpiar TSU con string vacío
  useEffect(() => {
    if (!pideTsu) {
      setValue('tsu', '');
    }
  }, [carreraSeleccionada, pideTsu, setValue]);

  const onSubmit = async (valores: FormularioValores) => {
    try {
      const nuevoId = Crypto.randomUUID();
      const ahora = new Date().toISOString();

      const registro = formularioARegistro(valores, {
        id: nuevoId,
        fuente: fuenteActual,
        creadoEn: ahora,
      });

      await repositorio.crear(registro);

      // Modo entrevista: muestra agradecimiento ~2s y reinicia
      setAgradecimiento(true);
      setTimeout(() => {
        reset({
          consentimiento: false,
          carrera: '',
          tsu: '',
          cuatrimestre: '',
          respuesta: '',
        });
        setAgradecimiento(false);
      }, 2000);
    } catch (err) {
      console.error('Error al guardar registro local:', err);
    }
  };

  if (agradecimiento) {
    return (
      <Pantalla conSafeArea={false}>
        <View className="flex-1 items-center justify-center px-6 bg-[#0A0F1A]">
          <View className="w-16 h-16 rounded-full bg-[#34D399]/10 border border-[#34D399] items-center justify-center mb-4">
            <CheckCircle2 size={36} color="#34D399" />
          </View>
          <Text className="text-xl font-mono font-bold text-[#E6EDF7] text-center mb-2">
            ¡RESPUESTA REGISTRADA!
          </Text>
          <Text className="text-sm font-mono text-[#8CA0BA] text-center leading-relaxed mb-4">
            Guardada localmente en SQLite como pendiente para sincronización.
          </Text>
          <View className="bg-[#111827] border border-[#243049] rounded px-3 py-1.5">
            <Text className="text-xs font-mono text-[#22D3EE]">
              Total capturadas en este dispositivo: {totalLocales + 1}
            </Text>
          </View>
        </View>
      </Pantalla>
    );
  }

  const longitudRespuesta = respuestaActual.trim().length;
  const esValidaLongitud = longitudRespuesta >= MIN_RESPUESTA && longitudRespuesta <= MAX_RESPUESTA;

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
          {/* Tarjeta de Consentimiento Informado */}
          <Tarjeta className="mb-4 bg-[#111827]/90 border-[#243049]">
            <View className="flex-row items-center gap-2 mb-2">
              <ShieldCheck size={18} color="#22D3EE" />
              <Text className="text-xs font-mono font-bold text-[#22D3EE] tracking-wider uppercase">
                Consentimiento Informado
              </Text>
            </View>
            <Text className="text-xs text-[#8CA0BA] leading-relaxed mb-3">
              {TEXTO_CONSENTIMIENTO}
            </Text>

            <Controller
              control={control}
              name="consentimiento"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  onPress={() => onChange(!value)}
                  className={`flex-row items-start p-3 rounded-[6px] border ${
                    value
                      ? 'bg-[#22D3EE]/10 border-[#22D3EE]'
                      : 'bg-[#1A2336] border-[#243049]'
                  }`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: Boolean(value) }}
                >
                  <View
                    className={`w-5 h-5 rounded border items-center justify-center mr-3 mt-0.5 ${
                      value
                        ? 'bg-[#22D3EE] border-[#22D3EE]'
                        : 'bg-[#0A0F1A] border-[#8CA0BA]'
                    }`}
                  >
                    {value && <CheckCircle2 size={14} color="#0A0F1A" />}
                  </View>
                  <Text className="text-xs font-mono text-[#E6EDF7] flex-1 leading-5">
                    {ETIQUETA_CONSENTIMIENTO}
                  </Text>
                </Pressable>
              )}
            />
            {errors.consentimiento && (
              <Text className="text-xs font-mono text-[#F87171] mt-1.5">
                {errors.consentimiento.message}
              </Text>
            )}
          </Tarjeta>

          {/* Formulario de captura */}
          <Tarjeta className="mb-4">
            <EncabezadoSeccion
              titulo="Datos Académicos"
              descripcion="Selecciona tu programa y cuatrimestre"
            />

            {/* Carrera */}
            <Campo
              label="Ingeniería"
              requerido
              error={errors.carrera?.message}
            >
              <Controller
                control={control}
                name="carrera"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-col gap-2">
                    {CARRERAS.map((c: Carrera) => {
                      const activo = value === c.id;
                      return (
                        <Pressable
                          key={c.id}
                          onPress={() => onChange(c.id)}
                          className={`p-3 rounded-[6px] border flex-row items-center justify-between ${
                            activo
                              ? 'bg-[#22D3EE]/10 border-[#22D3EE]'
                              : 'bg-[#1A2336] border-[#243049] active:bg-[#243049]'
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              activo ? 'text-[#22D3EE] font-bold' : 'text-[#E6EDF7]'
                            }`}
                          >
                            {c.etiqueta}
                          </Text>
                          {c.meta > 0 && (
                            <Text className="text-[10px] font-mono text-[#8CA0BA]">
                              Meta: {c.meta}
                            </Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </Campo>

            {/* TSU condicional si pideTsu */}
            {pideTsu && (
              <Campo
                label="TSU / Especialidad"
                requerido
                ayuda="Requerido para TI"
                error={errors.tsu?.message}
              >
                <Controller
                  control={control}
                  name="tsu"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-col gap-2">
                      {TSU_OPCIONES.map((t) => {
                        const activo = value === t.id;
                        return (
                          <Pressable
                            key={t.id}
                            onPress={() => onChange(t.id)}
                            className={`p-2.5 rounded-[6px] border flex-row items-center justify-between ${
                              activo
                                ? 'bg-[#FFB020]/10 border-[#FFB020]'
                                : 'bg-[#1A2336] border-[#243049] active:bg-[#243049]'
                            }`}
                          >
                            <Text
                              className={`text-xs font-mono ${
                                activo ? 'text-[#FFB020] font-bold' : 'text-[#E6EDF7]'
                              }`}
                            >
                              {t.etiqueta}
                            </Text>
                            <Text className="text-[10px] font-mono text-[#8CA0BA]">
                              [{t.id}]
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />
              </Campo>
            )}

            {/* Cuatrimestre */}
            <Campo
              label="Cuatrimestre"
              requerido
              ayuda="1° al 10°"
              error={errors.cuatrimestre?.message}
            >
              <Controller
                control={control}
                name="cuatrimestre"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row flex-wrap gap-1.5">
                    {CUATRIMESTRES.map((cuat) => {
                      const cuatStr = String(cuat);
                      const activo = value === cuatStr;
                      return (
                        <Pressable
                          key={cuat}
                          onPress={() => onChange(cuatStr)}
                          className={`w-9 h-9 rounded-[4px] border items-center justify-center ${
                            activo
                              ? 'bg-[#22D3EE] border-[#22D3EE]'
                              : 'bg-[#1A2336] border-[#243049] active:bg-[#243049]'
                          }`}
                        >
                          <Text
                            className={`text-xs font-mono font-bold ${
                              activo ? 'text-[#0A0F1A]' : 'text-[#E6EDF7]'
                            }`}
                          >
                            {cuat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </Campo>
          </Tarjeta>

          {/* Pregunta Oficial y Respuesta */}
          <Tarjeta className="mb-6">
            <EncabezadoSeccion
              titulo="Pregunta de Investigación"
              descripcion="Respuesta libre y anónima"
            />

            <View className="bg-[#1A2336] border border-[#243049] p-3 rounded-[6px] mb-3">
              <Text className="text-xs font-mono text-[#22D3EE] leading-relaxed">
                "{PREGUNTA_OFICIAL}"
              </Text>
            </View>

            <Campo
              label="Tu Respuesta"
              requerido
              error={errors.respuesta?.message}
            >
              <Controller
                control={control}
                name="respuesta"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    multiline
                    numberOfLines={6}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Escribe aquí tu opinión sincera sobre la pertinencia laboral de tu formación..."
                    placeholderTextColor="#64748B"
                    textAlignVertical="top"
                    className="w-full min-h-[140px] bg-[#0A0F1A] border border-[#243049] rounded-[6px] p-3 text-sm text-[#E6EDF7] font-mono leading-relaxed focus:border-[#22D3EE]"
                  />
                )}
              />
            </Campo>

            {/* Contador de caracteres */}
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-[11px] font-mono text-[#8CA0BA]">
                Mínimo {MIN_RESPUESTA} caracteres
              </Text>
              <Text
                className={`text-[11px] font-mono font-bold ${
                  longitudRespuesta === 0
                    ? 'text-[#8CA0BA]'
                    : esValidaLongitud
                    ? 'text-[#34D399]'
                    : 'text-[#FFB020]'
                }`}
              >
                {longitudRespuesta} / {MAX_RESPUESTA}
              </Text>
            </View>
          </Tarjeta>

          {/* Botón de Registro */}
          <Boton
            variante="primario"
            tamano="lg"
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR RESPUESTA'}
          </Boton>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pantalla>
  );
}
