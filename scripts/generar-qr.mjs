import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from '../resenias-dashboard/node_modules/qrcode/lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'resenias-dashboard', 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// URL a codificar: pasada por argumento o placeholder
const urlObjetivo = process.argv[2] || 'https://recolector-uptlax.vercel.app';
console.log(`\n📌 Generando código QR para: ${urlObjetivo}`);

const rutaPng = path.resolve(publicDir, 'qr.png');
const rutaSvg = path.resolve(publicDir, 'qr.svg');
const rutaCartel = path.resolve(publicDir, 'cartel.html');

// 1. Generar PNG alta resolución (1024x1024)
await QRCode.toFile(rutaPng, urlObjetivo, {
  width: 1024,
  margin: 2,
  color: {
    dark: '#0A0F1A',
    light: '#FFFFFF',
  },
  errorCorrectionLevel: 'H',
});
console.log(`  ✓ QR PNG generado en: ${rutaPng}`);

// 2. Generar SVG vectorial
const svgString = await QRCode.toString(urlObjetivo, {
  type: 'svg',
  margin: 1,
  color: {
    dark: '#0A0F1A',
    light: '#FFFFFF',
  },
  errorCorrectionLevel: 'H',
});
fs.writeFileSync(rutaSvg, svgString, 'utf-8');
console.log(`  ✓ QR SVG generado en: ${rutaSvg}`);

// 3. Generar Cartel Imprimible (cartel.html) con diseño Blueprint Industrial-Tech
const cartelHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cartel de Recolección · UPTlax 7C</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@600;700&display=swap');

    @page {
      size: letter portrait;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'JetBrains Mono', monospace;
      background-color: #0A0F1A;
      color: #E6EDF7;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 10px;
    }

    .blueprint-page {
      width: 100%;
      max-width: 800px;
      background-color: #0A0F1A;
      border: 3px solid #22D3EE;
      border-radius: 8px;
      padding: 30px;
      position: relative;
      box-shadow: 0 10px 40px rgba(34, 211, 238, 0.15);
      background-image: 
        linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .corner {
      position: absolute;
      width: 16px;
      height: 16px;
      border-color: #FFB020;
    }
    .top-left { top: -2px; left: -2px; border-top: 4px solid #FFB020; border-left: 4px solid #FFB020; }
    .top-right { top: -2px; right: -2px; border-top: 4px solid #FFB020; border-right: 4px solid #FFB020; }
    .bottom-left { bottom: -2px; left: -2px; border-bottom: 4px solid #FFB020; border-left: 4px solid #FFB020; }
    .bottom-right { bottom: -2px; right: -2px; border-bottom: 4px solid #FFB020; border-right: 4px solid #FFB020; }

    header {
      text-align: center;
      border-bottom: 2px dashed #243049;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }

    .institucion {
      font-size: 13px;
      font-weight: 700;
      color: #22D3EE;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .subtitulo {
      font-size: 11px;
      color: #8CA0BA;
      letter-spacing: 1px;
    }

    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 700;
      color: #FFFFFF;
      text-align: center;
      line-height: 1.25;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .pregunta-box {
      background-color: #111827;
      border-left: 4px solid #FFB020;
      border-right: 1px solid #243049;
      border-top: 1px solid #243049;
      border-bottom: 1px solid #243049;
      padding: 16px 20px;
      border-radius: 6px;
      margin-bottom: 24px;
    }

    .pregunta-tag {
      font-size: 10px;
      font-weight: 700;
      color: #FFB020;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
    }

    .pregunta-texto {
      font-size: 14px;
      color: #E6EDF7;
      line-height: 1.45;
      font-style: italic;
    }

    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
    }

    .qr-frame {
      background-color: #FFFFFF;
      padding: 16px;
      border-radius: 12px;
      border: 3px solid #22D3EE;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: inline-block;
    }

    .qr-frame img {
      display: block;
      width: 230px;
      height: 230px;
    }

    .scan-label {
      margin-top: 14px;
      font-size: 15px;
      font-weight: 700;
      color: #22D3EE;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
    }

    .url-label {
      margin-top: 4px;
      font-size: 11px;
      color: #8CA0BA;
    }

    .badges {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 24px;
      flex-wrap: wrap;
    }

    .badge {
      background-color: #1A2336;
      border: 1px solid #243049;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 11px;
      font-weight: 600;
      color: #E6EDF7;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .badge.highlight {
      border-color: #34D399;
      color: #34D399;
      background-color: rgba(52, 211, 153, 0.08);
    }

    footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px dashed #243049;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
    }

    @media print {
      body {
        background-color: #FFFFFF;
        color: #000000;
        padding: 0;
      }
      .blueprint-page {
        background-color: #FFFFFF;
        color: #000000;
        border-color: #000000;
        box-shadow: none;
        background-image: none;
        max-width: 100%;
        padding: 20px;
      }
      .corner { border-color: #000000 !important; }
      .institucion { color: #000000; }
      h1 { color: #000000; }
      .pregunta-box {
        background-color: #F3F4F6;
        border-color: #000000;
      }
      .pregunta-tag { color: #000000; }
      .pregunta-texto { color: #111827; }
      .qr-frame {
        border-color: #000000;
        box-shadow: none;
      }
      .scan-label { color: #000000; }
      .url-label { color: #374151; }
      .badge {
        background-color: #F9FAFB;
        border-color: #9CA3AF;
        color: #111827;
      }
      .badge.highlight {
        color: #000000;
        border-color: #000000;
      }
      footer {
        color: #6B7280;
        border-color: #D1D5DB;
      }
    }
  </style>
</head>
<body>
  <div class="blueprint-page">
    <div class="corner top-left"></div>
    <div class="corner top-right"></div>
    <div class="corner bottom-left"></div>
    <div class="corner bottom-right"></div>

    <header>
      <div class="institucion">Universidad Politécnica de Tlaxcala</div>
      <div class="subtitulo">Ingeniería en Tecnologías de la Información · Minería de Textos (Grupo 7C)</div>
    </header>

    <h1>TU OPINIÓN ES CLAVE PARA NUESTRA INVESTIGACIÓN ACADÉMICA</h1>

    <div class="pregunta-box">
      <div class="pregunta-tag">// Pregunta de Investigación Oficial</div>
      <div class="pregunta-texto">
        "¿Consideras que la formación que estás recibiendo en la UPTlax es pertinente y adecuada para las demandas y retos del campo laboral actual? ¿Por qué?"
      </div>
    </div>

    <div class="qr-container">
      <div class="qr-frame">
        <img src="qr.png" alt="Código QR para responder encuesta">
      </div>
      <div class="scan-label">▶ ESCANEA CON LA CÁMARA DE TU CELULAR ◀</div>
      <div class="url-label">${urlObjetivo}</div>
    </div>

    <div class="badges">
      <div class="badge highlight">⏱️ 2 MINUTOS</div>
      <div class="badge highlight">🔒 100% ANÓNIMO</div>
      <div class="badge">🚫 CERO DATOS PERSONALES</div>
      <div class="badge">🎓 USO ESTRICTAMENTE ACADÉMICO</div>
    </div>

    <footer>
      <span>Proyecto Final: Pertinencia de la Formación Académica</span>
      <span>UPTlax · 2026</span>
    </footer>
  </div>
</body>
</html>
`;

fs.writeFileSync(rutaCartel, cartelHtml, 'utf-8');
console.log(`  ✓ Cartel imprimible generado en: ${rutaCartel}`);
console.log('\n🎉 ¡Código QR y Cartel listos para impresión y difusión!\n');
