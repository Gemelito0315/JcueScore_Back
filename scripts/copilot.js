const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

// CONFIGURACIÓN (Pon tu API Key aquí)
// Opción 1: Cargar desde .env
// Opción 2: Pasar como variable de entorno: GEMINI_API_KEY=xxx node copilot.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY no configurada en .env o como variable de entorno");
  console.error("📋 Instrucciones:");
  console.error("   1. Copia .env.example a .env");
  console.error("   2. Agrega tu API Key de Gemini en GEMINI_API_KEY");
  console.error("   3. O ejecuta: GEMINI_API_KEY=xxx node copilot.js");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function aplicarCambio(rutaArchivo, requerimiento) {
    console.log(`🤖 Generando cambios para: ${rutaArchivo}...`);
    
    const prompt = `
    Eres un desarrollador experto en NestJS. 
    Requerimiento: ${requerimiento}
    
    Devuelve EXCLUSIVAMENTE el código completo del archivo para que yo pueda sobrescribirlo. 
    No des explicaciones, no saludes, solo el código dentro de un bloque \`\`\`ts.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const respuestaIA = response.text;
    const bloqueCodigo = respuestaIA.match(/```ts([\s\S]*?)```/)?.[1] || respuestaIA;

    fs.writeFileSync(rutaArchivo, bloqueCodigo.trim());
    console.log(`✅ Archivo ${rutaArchivo} actualizado correctamente. NestJS se recargará solo.`);
}

// --- AQUÍ EDITAS TU TAREA ---
const RUTA = 'src/app.controller.ts'; 
const TAREA = 'Cambia el endpoint GET / para que devuelva un objeto { "status": "ok", "message": "Bienvenido al Sistema de Billares" }';

aplicarCambio(RUTA, TAREA);