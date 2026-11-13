import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  formularioSchema,
  formularioARegistro,
  type FormularioValores,
  MIN_RESPUESTA,
  MAX_RESPUESTA,
} from '../shared/schema.ts';
import {
  CARRERAS,
  TSU_OPCIONES,
  CUATRIMESTRES,
  carreraPideTsu,
} from '../shared/carreras.ts';
import {
  PREGUNTA_OFICIAL,
  TEXTO_CONSENTIMIENTO,
  ETIQUETA_CONSENTIMIENTO,
} from '../shared/pregunta.ts';
import {
  Tarjeta,
  Boton,
  Campo,
  EncabezadoSeccion,
  Chip,
} from './blueprint/index.ts';
import {
  Factory,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export const FormularioRespuesta: React.FC = () => {
  const [estadoEnvio, setEstadoEnvio] = useState<
    'reposo' | 'enviando' | 'exito' | 'error'
  >('reposo');
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [ultimoIdEnviado, setUltimoIdEnviado] = useState<string>('');

  // El id nace en el cliente y se preserva durante reintentos por error de red
  const idRegistroRef = useRef<string>(crypto.randomUUID());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormularioValores>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      consentimiento: false,
      carrera: '',
      tsu: '',
      cuatrimestre: '',
      respuesta: '',
      sitio: '',
    },
  });

  const carreraSeleccionada = watch('carrera');
  const respuestaActual = watch('respuesta') || '';
  const pideTsu = carreraPideTsu(carreraSeleccionada);

  // Si cambia a una carrera que no pide TSU, limpiamos el campo
  useEffect(() => {
    if (!pideTsu) {
      setValue('tsu', '');
    }
  }, [carreraSeleccionada, pideTsu, setValue]);

  const carCount = respuestaActual.length;
  const faltanCaracteres = Math.max(0, MIN_RESPUESTA - carCount);

  const onSubmit = async (valores: FormularioValores) => {
    setEstadoEnvio('enviando');
    setErrorServidor(null);

    const extra = {
      id: idRegistroRef.current,
      fuente: 'web',
      creadoEn: new Date().toISOString(),
    };

    const registro = formularioARegistro(valores, extra);
    const payload = {
      ...registro,
      sitio: valores.sitio || '', // honeypot
    };

    try {
      const res = await fetch('/api/respuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setUltimoIdEnviado(idRegistroRef.current);
        setEstadoEnvio('exito');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (res.status === 400 && data.errores) {
        for (const err of data.errores) {
          setError(err.campo as any, { message: err.mensaje });
        }
        setErrorServidor('Por favor verifica los campos marcados en rojo.');
        setEstadoEnvio('error');
      } else if (res.status === 429) {
        setErrorServidor(
          'Se recibieron demasiadas solicitudes seguidas. Espera un momento y vuelve a presionar Enviar.',
        );
        setEstadoEnvio('error');
      } else {
        setErrorServidor(
          data.mensaje ||
            'Ocurrió un error en el servidor. Tu respuesta sigue intacta aquí para que puedas reintentar.',
        );
        setEstadoEnvio('error');
      }
    } catch {
      setErrorServidor(
        'Error de conexión con el servidor. Tu respuesta sigue aquí; revisa tu conexión y pulsa Reintentar.',
      );
      setEstadoEnvio('error');
    }
  };

  const reiniciarFormulario = () => {
    idRegistroRef.current = crypto.randomUUID();
    reset({
      consentimiento: false,
      carrera: '',
      tsu: '',
      cuatrimestre: '',
      respuesta: '',
      sitio: '',
    });
    setEstadoEnvio('reposo');
    setErrorServidor(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------------------------------------------------------
  // PANTALLA DE ÉXITO ("GRACIAS")
  // ---------------------------------------------------------
  if (estadoEnvio === 'exito') {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <Tarjeta className="text-center p-6 sm:p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-[8px] bg-[#34D399]/10 border border-[#34D399] flex items-center justify-center text-[#34D399] shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-block">
              <Chip estado="enviado" texto="REGISTRO COMPLETADO" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#E6EDF7] tracking-tight">
              ¡Registro recibido!
            </h2>
            <p className="font-sans text-sm text-[#8A97B1] leading-relaxed max-w-md mx-auto">
              Muchas gracias por aportar tu experiencia y perspectiva. Tu
              respuesta será analizada estrictamente para el proyecto académico
              de Minería de Textos (UPTlax, Grupo 7C).
            </p>
          </div>

          <div className="p-3 bg-[#1A2336] rounded-[6px] border border-[#243049] text-left">
            <span className="font-mono text-[11px] text-[#22D3EE] uppercase tracking-wider block mb-1">
              // Identificador de Confirmación
            </span>
            <p className="font-mono text-xs text-[#E6EDF7] break-all select-all">
              {ultimoIdEnviado}
            </p>
            <span className="font-mono text-[10px] text-[#8A97B1] block mt-1">
              * El folio oficial de investigación (R001...) se asignará al
              consolidar la exportación del estudio.
            </span>
          </div>

          <div className="pt-2">
            <Boton
              variante="primario"
              tamano="lg"
              icono={<RotateCcw className="w-4 h-4" />}
              onClick={reiniciarFormulario}
              className="w-full sm:w-auto"
            >
              Responder otra vez
            </Boton>
            <p className="font-mono text-[11px] text-[#8A97B1] mt-2">
              (Útil si estás compartiendo este dispositivo con otro compañero/a)
            </p>
          </div>
        </Tarjeta>
      </div>
    );
  }

  // ---------------------------------------------------------
  // FORMULARIO PRINCIPAL
  // ---------------------------------------------------------
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto pb-28 sm:pb-8"
      noValidate
    >
      {/* Honeypot anti-spam invisible pero accesible para bots */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <label htmlFor="campo-sitio">No llenar si eres humano:</label>
        <input
          id="campo-sitio"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('sitio')}
        />
      </div>

      {/* Alerta de error global de servidor */}
      {errorServidor && (
        <div className="p-4 rounded-[6px] bg-[#F87171]/10 border border-[#F87171]/40 flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-mono text-xs font-semibold text-[#F87171] uppercase tracking-wider">
              Error al procesar envío
            </h4>
            <p className="font-sans text-xs text-[#E6EDF7] mt-0.5 leading-relaxed">
              {errorServidor}
            </p>
          </div>
        </div>
      )}

      {/* PASO 01: CONSENTIMIENTO INFORMADO */}
      <Tarjeta>
        <EncabezadoSeccion
          numero="01"
          titulo="Consentimiento Informado"
          descripcion="Participación voluntaria y anónima con fines puramente académicos."
          color="cyan"
        />

        <div className="mt-4 space-y-4">
          <div className="p-3.5 bg-[#1A2336] rounded-[6px] border border-[#243049] flex items-start gap-3 text-left">
            <ShieldCheck className="w-5 h-5 text-[#22D3EE] shrink-0 mt-0.5" />
            <p className="font-sans text-xs sm:text-sm text-[#E6EDF7] leading-relaxed">
              {TEXTO_CONSENTIMIENTO}
            </p>
          </div>

          <label
            htmlFor="consentimiento-check"
            className="flex items-start gap-3 p-3 rounded-[6px] border border-[#243049] hover:border-[#22D3EE]/50 bg-[#111827] cursor-pointer transition-colors"
          >
            <input
              id="consentimiento-check"
              type="checkbox"
              className="mt-1 w-4 h-4 rounded-[3px] accent-[#22D3EE] bg-[#1A2336] border-[#243049] text-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/30 focus:outline-none cursor-pointer"
              {...register('consentimiento')}
            />
            <span className="font-sans text-xs sm:text-sm text-[#E6EDF7] font-medium leading-normal select-none">
              {ETIQUETA_CONSENTIMIENTO}
            </span>
          </label>

          {errors.consentimiento && (
            <span className="text-xs font-mono text-[#F87171] flex items-center gap-1.5 mt-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F87171]" />
              {errors.consentimiento.message}
            </span>
          )}
        </div>
      </Tarjeta>

      {/* PASO 02: PERFIL DEL ESTUDIANTE */}
      <Tarjeta>
        <EncabezadoSeccion
          numero="02"
          titulo="Datos Académicos"
          descripcion="Para contextualizar el análisis por programa de estudio."
          color="amber"
        />

        <div className="mt-4 space-y-4">
          {/* Carrera */}
          <Campo
            label="Carrera en la UPTlax"
            requerido
            error={errors.carrera?.message}
            id="select-carrera"
          >
            <select
              id="select-carrera"
              className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] px-3.5 py-2.5 text-sm font-sans text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/25 transition-all"
              {...register('carrera')}
            >
              <option value="">-- Selecciona tu carrera --</option>
              {CARRERAS.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#111827]">
                  {c.etiqueta}
                </option>
              ))}
            </select>
          </Campo>

          {/* TSU / Especialidad (solo si es carrera que pide TSU, como TI) */}
          {pideTsu && (
            <div className="animate-fadeIn">
              <Campo
                label="TSU / Especialidad"
                requerido
                error={errors.tsu?.message}
                ayuda="Obligatorio para TI"
                id="select-tsu"
              >
                <select
                  id="select-tsu"
                  className="w-full bg-[#1A2336] border border-[#22D3EE]/40 rounded-[6px] px-3.5 py-2.5 text-sm font-sans text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/30 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                  {...register('tsu')}
                >
                  <option value="">-- Selecciona tu especialidad / TSU --</option>
                  {TSU_OPCIONES.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#111827]">
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>
          )}

          {/* Cuatrimestre */}
          <Campo
            label="Cuatrimestre que cursas actualmente"
            requerido
            error={errors.cuatrimestre?.message}
            id="select-cuatrimestre"
          >
            <select
              id="select-cuatrimestre"
              className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] px-3.5 py-2.5 text-sm font-sans text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/25 transition-all"
              {...register('cuatrimestre')}
            >
              <option value="">-- Selecciona cuatrimestre --</option>
              {CUATRIMESTRES.map((cuat) => (
                <option key={cuat} value={String(cuat)} className="bg-[#111827]">
                  {cuat}° Cuatrimestre
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Tarjeta>

      {/* PASO 03: PREGUNTA OFICIAL Y RESPUESTA */}
      <Tarjeta>
        <EncabezadoSeccion
          numero="03"
          titulo="Valoración de tu Formación"
          descripcion="Tu opinión sincera es la materia prima del análisis de pertinencia."
          color="cyan"
        />

        <div className="mt-4 space-y-4">
          {/* Texto íntegro de la PREGUNTA OFICIAL sin parafraseo ni ejemplos */}
          <div className="p-4 bg-[#1A2336] border-l-4 border-[#22D3EE] rounded-r-[6px] text-left">
            <span className="font-mono text-[11px] font-semibold text-[#22D3EE] uppercase tracking-wider block mb-1">
              PREGUNTA OFICIAL DEL ESTUDIO
            </span>
            <p className="font-sans text-[15px] sm:text-[16px] text-[#E6EDF7] leading-relaxed font-normal">
              {PREGUNTA_OFICIAL}
            </p>
          </div>

          {/* Área de texto con contador */}
          <Campo
            label="Tu respuesta abierta"
            requerido
            error={errors.respuesta?.message}
            id="campo-respuesta"
          >
            <textarea
              id="campo-respuesta"
              rows={7}
              placeholder="Escribe aquí ampliamente con tus propias palabras..."
              maxLength={MAX_RESPUESTA}
              className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] p-3.5 text-sm sm:text-base font-sans text-[#E6EDF7] placeholder-[#8A97B1]/40 focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/25 transition-all resize-y min-h-[160px]"
              {...register('respuesta')}
            />

            {/* Contador en estilo monospaced y guía de longitud */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-[#243049]/50">
              <span className="font-mono text-xs text-[#8A97B1]">
                Longitud:{' '}
                <span
                  className={
                    carCount < MIN_RESPUESTA
                      ? 'text-[#FFB020] font-semibold'
                      : 'text-[#34D399] font-semibold'
                  }
                >
                  {String(carCount).padStart(4, '0')}
                </span>{' '}
                / {MAX_RESPUESTA} car.
              </span>

              {carCount < MIN_RESPUESTA ? (
                <span className="font-mono text-[11px] text-[#FFB020] flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFB020]" />
                  Faltan {faltanCaracteres} car. para el mínimo
                </span>
              ) : (
                <span className="font-mono text-[11px] text-[#34D399] flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  Longitud válida para análisis
                </span>
              )}
            </div>
          </Campo>
        </div>
      </Tarjeta>

      {/* BOTÓN DE ACCIÓN (FIJO INFERIOR EN MÓVIL, ESTÁTICO EN ESCRITORIO) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0A0F1A]/90 backdrop-blur-md border-t border-[#243049] z-30 sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <Boton
            type="submit"
            variante="primario"
            tamano="lg"
            disabled={estadoEnvio === 'enviando'}
            icono={
              estadoEnvio === 'enviando' ? (
                <Cpu className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )
            }
            className="w-full sm:flex-1"
          >
            {estadoEnvio === 'enviando'
              ? 'Registrando en sistema...'
              : 'Enviar respuesta'}
          </Boton>
        </div>
      </div>
    </form>
  );
};
