const API_URL = import.meta.env.VITE_API_URL;

// Helper genérico para manejar respuestas
async function handleResponse(response) {
  const text = await response.text();
  if (!response.ok) {
    let message = text || 'Error en la petición al servidor';
    try {
      const json = JSON.parse(text);
      message = json.detail || JSON.stringify(json);
    } catch {
      // dejamos message tal cual
    }
    throw new Error(message);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Normaliza el payload para el backend (GeneradorInput)
function buildGeneradorInput(formData, temaFinal) {
  return {
    nombre: formData.nombre,
    pais: formData.pais,
    tema: temaFinal,
    indexacion: formData.tipoArticulo, // el backend espera "indexacion"
  };
}

// ──────────────────────────
// ETAPA 1 — Generar artículo
// ──────────────────────────
export async function generarArticulo(datosGenerador) {
  const res = await fetch(`${API_URL}/generar-articulo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosGenerador),
  });
  return handleResponse(res);
}

// ──────────────────────────────
// ETAPA 2 — Generar referencias
// ──────────────────────────────
export async function generarReferencias(datosGenerador) {
  const res = await fetch(`${API_URL}/generar-referencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosGenerador),
  });
  return handleResponse(res);
}

// ───────────────────────────────
// ETAPA 3 — Documento de búsqueda
// ───────────────────────────────
export async function buscarArticulos(datosGenerador) {
  const res = await fetch(`${API_URL}/buscar-articulos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosGenerador),
  });
  return handleResponse(res);
}

// ──────────────────────────────────────
// ETAPA 5 (unificada) — PRISMA + Metodología
// ──────────────────────────────────────
export async function generarMetodologiaPrisma(datosGenerador) {
  const res = await fetch(`${API_URL}/generar-metodologia-prisma`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosGenerador),
  });
  return handleResponse(res);
}

// ──────────────────────────────────────
// ETAPA 6 — Discusión + Conclusión
// ──────────────────────────────────────
export async function generarDiscusionConclusion(datosGenerador) {
  const res = await fetch(`${API_URL}/generar-discusion-conclusion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosGenerador),
  });
  return handleResponse(res);
}

// ─────────────────────────────
// ETAPA 7 — Resumen final
// ─────────────────────────────
export async function generarResumenFinal(datosGenerador) {
  const res = await fetch(`${API_URL}/generar-resumen-final`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosGenerador),
  });
  return handleResponse(res);
}

// ─────────────────────────────
// PIPELINE COMPLETO (1–7)
// ─────────────────────────────
export async function ejecutarPipelineCompleto(datosGenerador) {
  const payload = { datos: datosGenerador };
  const res = await fetch(`${API_URL}/pipeline-completo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ─────────────────────────────
// INTEGRAR 7 ETAPAS (manual)
// ─────────────────────────────
export async function integrar7Etapas(rutaArticuloFinal, rutaReferenciasDoc) {
  const payload = {
    ruta_articulo_final: rutaArticuloFinal,
    ruta_referencias_doc: rutaReferenciasDoc,
  };

  const res = await fetch(`${API_URL}/integrar-7-etapas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export { buildGeneradorInput };
