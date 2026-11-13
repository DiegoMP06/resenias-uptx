import React, { useState, useEffect, useCallback } from 'react';
import {
  Tarjeta,
  Boton,
  Campo,
  EncabezadoSeccion,
  Chip,
} from './blueprint/index.ts';
import { CARRERAS, etiquetaCarrera, etiquetaTsu } from '../shared/carreras.ts';
import {
  Factory,
  Cpu,
  Gauge,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  LogOut,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Layers,
  Database,
  Search,
} from 'lucide-react';

interface CarreraResumen {
  carrera: string;
  etiqueta: string;
  corta: string;
  total: number;
  meta: number;
}

interface TsuResumen {
  tsu: string;
  etiqueta: string;
  total: number;
}

interface CuatrimestreResumen {
  cuatrimestre: number;
  total: number;
}

interface FuenteResumen {
  fuente: string;
  total: number;
}

interface RegistroMarcado {
  id: string;
  carrera: string;
  tsu: string | null;
  cuatrimestre: number;
  respuesta: string;
  fuente: string;
  posibleDuplicado: number | null;
  posiblePii: string | null;
  creadoEn: string;
}

interface DatosResumen {
  total: number;
  validos: number;
  posiblesDuplicados: number;
  posiblePii: number;
  porCarrera: CarreraResumen[];
  porCuatrimestre: CuatrimestreResumen[];
  porTsu: TsuResumen[];
  porFuente: FuenteResumen[];
  marcados?: RegistroMarcado[];
}

const STORAGE_KEY = 'uptlax_admin_token';

export const PanelAdmin: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const [datos, setDatos] = useState<DatosResumen | null>(null);
  const [carreraExportar, setCarreraExportar] = useState<string>('');
  const [incluirDuplicados, setIncluirDuplicados] = useState<boolean>(false);
  const [descargandoFormato, setDescargandoFormato] = useState<string | null>(null);

  // Cargar token guardado en sesión
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
      cargarResumen(saved);
    }
  }, []);

  const cargarResumen = useCallback(async (tokenAUsar: string) => {
    setCargando(true);
    setErrorLogin(null);

    try {
      const res = await fetch('/api/resumen', {
        headers: {
          Authorization: `Bearer ${tokenAUsar}`,
        },
      });

      if (res.status === 401) {
        sessionStorage.removeItem(STORAGE_KEY);
        setAutenticado(false);
        setToken('');
        setErrorLogin('Token incorrecto o no autorizado. Por favor verifica tus credenciales.');
        setCargando(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Error al cargar métricas del servidor');
      }

      const json = await res.json();
      setDatos(json);
      setAutenticado(true);
      sessionStorage.setItem(STORAGE_KEY, tokenAUsar);
    } catch (err: any) {
      setErrorLogin(err?.message || 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setToken(tokenInput.trim());
    cargarResumen(tokenInput.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken('');
    setAutenticado(false);
    setDatos(null);
    setTokenInput('');
  };

  const descargarArchivo = async (formato: 'csv' | 'xlsx') => {
    setDescargandoFormato(formato);
    try {
      const params = new URLSearchParams();
      params.set('formato', formato);
      if (carreraExportar) params.set('carrera', carreraExportar);
      if (incluirDuplicados) params.set('duplicados', '1');

      const res = await fetch(`/api/exportar?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Error al generar la exportación');
      }

      // Extraer nombre del archivo del header o generar por defecto
      let filename = `respuestas_${carreraExportar || 'todas'}_${new Date().toISOString().slice(0, 10)}.${formato}`;
      const disposition = res.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`No se pudo descargar el archivo: ${err?.message}`);
    } finally {
      setDescargandoFormato(null);
    }
  };

  // -------------------------------------------------------------------
  // PANTALLA DE ACCESO (LOGIN POR TOKEN)
  // -------------------------------------------------------------------
  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <Tarjeta>
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-[6px] bg-[#111827] border border-[#FFB020] flex items-center justify-center text-[#FFB020] mx-auto mb-3 shadow-[0_0_15px_rgba(255,176,32,0.2)]">
              <Lock className="w-6 h-6" />
            </div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#FFB020]">
              ACCESO RESTRINGIDO
            </span>
            <h2 className="font-display text-2xl font-bold text-[#E6EDF7] tracking-tight mt-1">
              Tablero de Supervisión
            </h2>
            <p className="font-sans text-xs text-[#8A97B1] mt-1">
              Ingresa el token de administrador para supervisar la recolección y exportar datos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Campo
              label="Token de Administrador (ADMIN_TOKEN)"
              requerido
              error={errorLogin || undefined}
              id="admin-token-input"
            >
              <input
                id="admin-token-input"
                type="password"
                placeholder="Pega aquí el secreto de administración..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoFocus
                className="w-full bg-[#1A2336] border border-[#243049] rounded-[6px] px-3.5 py-2.5 text-sm font-mono text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/25 transition-all"
              />
            </Campo>

            <Boton
              type="submit"
              variante="primario"
              tamano="lg"
              disabled={cargando || !tokenInput.trim()}
              className="w-full"
            >
              {cargando ? 'Verificando credencial...' : 'Entrar al Tablero'}
            </Boton>
          </form>

          <div className="mt-6 pt-4 border-t border-[#243049] text-center font-mono text-[11px] text-[#8A97B1]">
            UPTlax · Minería de Textos 7C · Acceso con tiempo constante
          </div>
        </Tarjeta>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // TABLERO PRINCIPAL DE CONTROL
  // -------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Barra de estado y acciones del supervisor */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[6px] bg-[#111827] border border-[#243049]">
        <div className="flex items-center gap-3">
          <Chip estado="info" texto="SUPERVISOR ACTIVO" />
          <span className="font-mono text-xs text-[#8A97B1] hidden sm:inline-block">
            Base conectada: libSQL / Turso
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Boton
            variante="secundario"
            tamano="sm"
            icono={<RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />}
            onClick={() => cargarResumen(token)}
            disabled={cargando}
          >
            Actualizar
          </Boton>

          <Boton
            variante="peligro"
            tamano="sm"
            icono={<LogOut className="w-3.5 h-3.5" />}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Boton>
        </div>
      </div>

      {/* 1. TARJETAS KPI (INDICADORES DE PLANTA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total */}
        <Tarjeta className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#8A97B1] uppercase tracking-wider">
              TOTAL RESPUESTAS
            </span>
            <Database className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <p className="font-display text-3xl sm:text-4xl font-bold text-[#E6EDF7] mt-2">
            {datos?.total ?? 0}
          </p>
          <span className="font-mono text-[11px] text-[#8A97B1] block mt-1">
            Registros en el sistema
          </span>
        </Tarjeta>

        {/* KPI: Válidas */}
        <Tarjeta className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#8A97B1] uppercase tracking-wider">
              VÁLIDAS / LIMPIAS
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <p className="font-display text-3xl sm:text-4xl font-bold text-[#34D399] mt-2">
            {datos?.validos ?? 0}
          </p>
          <span className="font-mono text-[11px] text-[#8A97B1] block mt-1">
            Sin marcas de duplicado
          </span>
        </Tarjeta>

        {/* KPI: Posibles Duplicados */}
        <Tarjeta className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#8A97B1] uppercase tracking-wider">
              DUPLICADOS
            </span>
            <AlertTriangle className="w-4 h-4 text-[#FFB020]" />
          </div>
          <p
            className={`font-display text-3xl sm:text-4xl font-bold mt-2 ${
              (datos?.posiblesDuplicados ?? 0) > 0 ? 'text-[#FFB020]' : 'text-[#E6EDF7]'
            }`}
          >
            {datos?.posiblesDuplicados ?? 0}
          </p>
          <span className="font-mono text-[11px] text-[#8A97B1] block mt-1">
            Mismo hash de contenido
          </span>
        </Tarjeta>

        {/* KPI: Posible PII */}
        <Tarjeta className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#8A97B1] uppercase tracking-wider">
              POSIBLE PII
            </span>
            <ShieldAlert className="w-4 h-4 text-[#F87171]" />
          </div>
          <p
            className={`font-display text-3xl sm:text-4xl font-bold mt-2 ${
              (datos?.posiblePii ?? 0) > 0 ? 'text-[#F87171]' : 'text-[#E6EDF7]'
            }`}
          >
            {datos?.posiblePii ?? 0}
          </p>
          <span className="font-mono text-[11px] text-[#8A97B1] block mt-1">
            Para revisión manual
          </span>
        </Tarjeta>
      </div>

      {/* 2. MEDIDORES DE AVANCE CONTRA META POR CARRERA */}
      <Tarjeta>
        <EncabezadoSeccion
          numero="01"
          titulo="Avance de Recolección contra Metas de Carrera"
          descripcion="Medidores de planta segmentados (Industrial: meta 600, TI: meta 100)."
          color="cyan"
        />

        <div className="mt-5 space-y-5">
          {datos?.porCarrera.map((c) => {
            const tieneMeta = c.meta > 0;
            const porcentaje = tieneMeta ? Math.min(100, (c.total / c.meta) * 100) : 0;
            const porcentajeTxt = tieneMeta ? `${porcentaje.toFixed(1)}%` : 'Sin meta fijada';
            const completada = tieneMeta && c.total >= c.meta;

            return (
              <div
                key={c.carrera}
                className="p-3.5 bg-[#1A2336] rounded-[6px] border border-[#243049] space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <span className="font-display text-sm font-semibold text-[#E6EDF7]">
                      {c.etiqueta}
                    </span>
                    <span className="font-mono text-xs text-[#8A97B1] ml-2">
                      ({c.corta})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="font-mono text-xs font-semibold text-[#E6EDF7]">
                      {c.total} {tieneMeta && `/ ${c.meta}`}
                    </span>
                    {tieneMeta && (
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded-[4px] font-semibold ${
                          completada
                            ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40'
                            : 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30'
                        }`}
                      >
                        {porcentajeTxt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Medidor segmentado tipo tablero industrial (10 segmentos) */}
                {tieneMeta && (
                  <div className="grid grid-cols-10 gap-1.5 h-3 pt-1">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const umbral = (idx + 1) * 10;
                      const lleno = porcentaje >= umbral;
                      const parcial = porcentaje > idx * 10 && porcentaje < umbral;

                      let bgClass = 'bg-[#111827] border border-[#243049]';
                      if (lleno) {
                        bgClass = completada
                          ? 'bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                          : 'bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.3)]';
                      } else if (parcial) {
                        bgClass = 'bg-[#FFB020] animate-pulse';
                      }

                      return (
                        <div
                          key={idx}
                          className={`h-full rounded-[2px] transition-all duration-300 ${bgClass}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Tarjeta>

      {/* 3. MÓDULO DE EXPORTACIÓN DE DATASET */}
      <Tarjeta>
        <EncabezadoSeccion
          numero="02"
          titulo="Exportación Oficial del Dataset"
          descripcion="Genera archivos para minería de textos en formato CSV (UTF-8 con BOM) y Excel (XLSX)."
          color="amber"
        />

        <div className="mt-5 p-4 bg-[#1A2336] rounded-[6px] border border-[#243049] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filtro por Carrera */}
            <Campo label="Filtrar por Carrera" id="filtro-carrera-exportar">
              <select
                id="filtro-carrera-exportar"
                value={carreraExportar}
                onChange={(e) => setCarreraExportar(e.target.value)}
                className="w-full bg-[#111827] border border-[#243049] rounded-[6px] px-3.5 py-2.5 text-sm font-sans text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/25 transition-all"
              >
                <option value="">-- Todas las carreras ({datos?.total ?? 0} registros) --</option>
                {CARRERAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.etiqueta}
                  </option>
                ))}
              </select>
            </Campo>

            {/* Inclusión de duplicados */}
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={incluirDuplicados}
                  onChange={(e) => setIncluirDuplicados(e.target.checked)}
                  className="w-4 h-4 rounded-[3px] accent-[#22D3EE] bg-[#111827] border-[#243049] text-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/30 focus:outline-none cursor-pointer"
                />
                <span className="font-sans text-xs sm:text-sm text-[#E6EDF7]">
                  Incluir registros con posible duplicado (posible_duplicado = 1)
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Boton
              variante="primario"
              tamano="md"
              icono={<Download className="w-4 h-4" />}
              disabled={descargandoFormato !== null}
              onClick={() => descargarArchivo('csv')}
            >
              {descargandoFormato === 'csv'
                ? 'Generando CSV...'
                : 'Descargar CSV (UTF-8 con BOM)'}
            </Boton>

            <Boton
              variante="secundario"
              tamano="md"
              icono={<FileSpreadsheet className="w-4 h-4 text-[#34D399]" />}
              disabled={descargandoFormato !== null}
              onClick={() => descargarArchivo('xlsx')}
            >
              {descargandoFormato === 'xlsx'
                ? 'Generando Excel...'
                : 'Descargar Excel (XLSX con formato)'}
            </Boton>
          </div>

          <p className="font-mono text-[11px] text-[#8A97B1] pt-1">
            * Los folios de investigación consecutivos (R001...) se generan automáticamente ordenados por fecha de captura.
          </p>
        </div>
      </Tarjeta>

      {/* 4. DESGLOSES COMPLEMENTARIOS (TSU, CUATRIMESTRE, FUENTE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Desglose por TSU */}
        <Tarjeta className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-[#22D3EE]" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#E6EDF7]">
              // TSU / Especialidad (TI)
            </h4>
          </div>
          <div className="space-y-2">
            {datos?.porTsu.map((t) => (
              <div
                key={t.tsu}
                className="flex items-center justify-between p-2 rounded-[4px] bg-[#1A2336] border border-[#243049] text-xs font-mono"
              >
                <span className="text-[#8A97B1] truncate">{t.etiqueta}</span>
                <span className="font-semibold text-[#22D3EE]">{t.total}</span>
              </div>
            ))}
          </div>
        </Tarjeta>

        {/* Desglose por Fuente */}
        <Tarjeta className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#FFB020]" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#E6EDF7]">
              // Punto de Captura
            </h4>
          </div>
          <div className="space-y-2">
            {datos?.porFuente.map((f) => (
              <div
                key={f.fuente}
                className="flex items-center justify-between p-2 rounded-[4px] bg-[#1A2336] border border-[#243049] text-xs font-mono"
              >
                <span className="text-[#8A97B1]">{f.fuente === 'web' ? 'Navegador Web' : `App (${f.fuente})`}</span>
                <span className="font-semibold text-[#FFB020]">{f.total}</span>
              </div>
            ))}
          </div>
        </Tarjeta>

        {/* Desglose por Cuatrimestre */}
        <Tarjeta className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-[#34D399]" />
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#E6EDF7]">
              // Por Cuatrimestre
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {datos?.porCuatrimestre.map((c) => (
              <div
                key={c.cuatrimestre}
                className="p-1.5 rounded-[4px] bg-[#1A2336] border border-[#243049] text-center font-mono text-[11px]"
              >
                <span className="text-[#8A97B1] block">{c.cuatrimestre}°</span>
                <span className="font-semibold text-[#E6EDF7]">{c.total}</span>
              </div>
            ))}
          </div>
        </Tarjeta>
      </div>

      {/* 5. TABLA DE REVISIÓN MANUAL (REGISTROS MARCADOS) */}
      <Tarjeta>
        <EncabezadoSeccion
          numero="03"
          titulo="Registros Marcados para Revisión Manual"
          descripcion="Listado de respuestas con posibles datos de contacto o duplicación de contenido."
          color="cyan"
        />

        <div className="mt-5">
          {!datos?.marcados || datos.marcados.length === 0 ? (
            <div className="p-6 rounded-[6px] bg-[#1A2336] border border-[#243049] text-center">
              <CheckCircle2 className="w-8 h-8 text-[#34D399] mx-auto mb-2" />
              <p className="font-mono text-xs text-[#34D399]">
                ✓ No hay registros con alertas de duplicado o datos personales.
              </p>
              <p className="font-sans text-xs text-[#8A97B1] mt-0.5">
                La base de datos se encuentra completamente limpia y validada.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[6px] border border-[#243049]">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-[#1A2336] font-mono text-[11px] uppercase tracking-wider text-[#8A97B1] border-b border-[#243049]">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Carrera / TSU</th>
                    <th className="p-3">Motivo de Alerta</th>
                    <th className="p-3">Fragmento de Respuesta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243049] bg-[#111827]">
                  {datos.marcados.map((m) => {
                    return (
                      <tr key={m.id} className="hover:bg-[#1A2336]/60 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-[#8A97B1] whitespace-nowrap">
                          {m.creadoEn.slice(0, 16).replace('T', ' ')}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-medium text-[#E6EDF7]">
                            {etiquetaCarrera(m.carrera)}
                          </span>
                          {m.tsu && (
                            <span className="font-mono text-[10px] text-[#22D3EE] block">
                              TSU: {etiquetaTsu(m.tsu)}
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap space-x-1.5">
                          {m.posibleDuplicado === 1 && (
                            <Chip estado="pendiente" texto="DUPLICADO" />
                          )}
                          {m.posiblePii && (
                            <Chip
                              estado="error"
                              texto={`PII: ${m.posiblePii}`}
                            />
                          )}
                        </td>
                        <td className="p-3 text-[#E6EDF7] max-w-md">
                          <p className="line-clamp-2 font-sans leading-relaxed">
                            {m.respuesta}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Tarjeta>
    </div>
  );
};
