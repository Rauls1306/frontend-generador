import React, { useState } from 'react';
import {
  generarArticulo,
  generarReferencias,
  buscarArticulos,
  ejecutarPipelineCompleto,
  generarMetodologiaPrisma,
  generarDiscusionConclusion,
  generarResumenFinal,
  integrar7Etapas,
  buildGeneradorInput,
} from '../services/articleService';

const countries = ['Perú', 'México', 'Colombia', 'Argentina', 'Chile'];
const articleTypes = ['LatIndex', 'SciELO', 'Scopus Q3–Q4', 'Scopus Q1–Q2'];

const sugerencias = {
  Perú: {
    LatIndex: ['Educación rural en el Perú y sus desafíos'],
    'Scopus Q1–Q2': ['Desarrollo de energías renovables en los Andes peruanos'],
    default: ['Impacto ambiental de la minería en zonas rurales del Perú'],
  },
  México: {
    SciELO: ['Didáctica en comunidades indígenas del sur de México'],
    'Scopus Q3–Q4': ['Contaminación del aire en la Ciudad de México y salud pública'],
    default: ['Urbanización acelerada y calidad del aire'],
  },
  default: {
    default: ['Desarrollo sostenible en Latinoamérica'],
  },
};

const ArticleForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    tipoArticulo: '',
    tema: '',
  });

  const [temaGenerado, setTemaGenerado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accionActual, setAccionActual] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ultimoResultado, setUltimoResultado] = useState(null);

  // Rutas necesarias para la integración manual 7 etapas
  const [rutaReferencias, setRutaReferencias] = useState('');
  const [rutaArticuloFinal, setRutaArticuloFinal] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setMensaje('');
  };

  const generarTemaAutomatico = () => {
    const pais = formData.pais || 'default';
    const tipo = formData.tipoArticulo || 'default';

    const temasPorPais = sugerencias[pais] || sugerencias['default'];
    const opciones =
      temasPorPais[tipo] ||
      temasPorPais['default'] ||
      sugerencias['default']['default'];

    return opciones[Math.floor(Math.random() * opciones.length)];
  };

  // Resuelve el tema final y arma el payload para el backend
  const prepararDatosGenerador = () => {
    let temaFinal = formData.tema.trim().toLowerCase();

    if (!temaFinal || ['no sé', 'nose', 'no se'].includes(temaFinal)) {
      const generado = generarTemaAutomatico();
      setTemaGenerado(generado);
      temaFinal = generado;
    } else {
      setTemaGenerado('');
    }

    return buildGeneradorInput(formData, temaFinal);
  };

  const manejarError = (error) => {
    console.error(error);
    setMensaje(`❌ ${error.message || 'Ocurrió un error en la petición'}`);
  };

  // ──────────────────────────
  // Handlers por ETAPA
  // ──────────────────────────

  // Etapa 1: solo generar artículo base
  const handleGenerarArticulo = async (e) => {
    e.preventDefault();
    setAccionActual('Generando artículo base...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      const datosGenerador = prepararDatosGenerador();
      const data = await generarArticulo(datosGenerador);
      console.log('Respuesta /generar-articulo:', data);
      setUltimoResultado(data);
      setMensaje(
        `✅ Artículo base generado.\nArchivo: ${data.archivo_generado || 'ver consola'}`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  // Etapa 2: solo referencias
  const handleGenerarReferencias = async (e) => {
    e.preventDefault();
    setAccionActual('Generando documento de referencias...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      const datosGenerador = prepararDatosGenerador();
      const data = await generarReferencias(datosGenerador);
      console.log('Respuesta /generar-referencias:', data);
      setUltimoResultado(data);

      const rutaRef =
        data.archivo_referencias ||
        data.archivo ||
        data.ruta_archivo ||
        '';

      if (rutaRef) {
        setRutaReferencias(rutaRef);
      }

      setMensaje(
        `✅ Referencias generadas.\nArchivo: ${
          rutaRef || 'ver consola'
        }\n💾 Ruta de referencias guardada para integración.`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  // Etapa 3: solo documento de búsqueda
  const handleBuscarArticulos = async (e) => {
    e.preventDefault();
    setAccionActual('Generando documento de búsqueda de artículos...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      const datosGenerador = prepararDatosGenerador();
      const data = await buscarArticulos(datosGenerador);
      console.log('Respuesta /buscar-articulos:', data);
      setUltimoResultado(data);
      setMensaje(
        `✅ Documento de búsqueda generado.\nArchivo: ${
          data.archivo_busqueda || data.archivo || 'ver consola'
        }`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  // Etapa 4 (unificada): PRISMA + Metodología + Figura PRISMA
  const handleGenerarMetodologiaPrisma = async (e) => {
    e.preventDefault();
    setAccionActual('Generando PRISMA y metodología...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      const datosGenerador = prepararDatosGenerador();
      const data = await generarMetodologiaPrisma(datosGenerador);
      console.log('Respuesta /generar-metodologia-prisma:', data);
      setUltimoResultado(data);

      const stats = (data.prisma && data.prisma.stats) || {};
      const bases = Object.keys(stats || {});
      const totalIncluidos = Object.values(stats || {}).reduce(
        (acc, baseStats) => acc + (baseStats.incluidos || 0),
        0
      );

      setMensaje(
        `✅ PRISMA + Metodología generadas.\n` +
        `Bases procesadas: ${bases.join(', ') || 'N/D'}\n` +
        `Artículos totales incluidos (PRISMA): ${totalIncluidos || 'N/D'}\n` +
        `Artículo actualizado: ${data.ruta_articulo_actualizado || 'ver consola'}`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  // Etapa 5: Discusión + Conclusión automáticas
  const handleGenerarDiscusionConclusion = async (e) => {
    e.preventDefault();
    setAccionActual('Generando discusión y conclusiones...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      const datosGenerador = prepararDatosGenerador();
      const data = await generarDiscusionConclusion(datosGenerador);
      console.log('Respuesta /generar-discusion-conclusion:', data);
      setUltimoResultado(data);

      setMensaje(
        `✅ Discusión y Conclusión generadas.\nArtículo actualizado: ${
          data.ruta_articulo_actualizado || 'ver consola'
        }`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  // Etapa 6: Resumen final automático
  const handleGenerarResumenFinal = async (e) => {
    e.preventDefault();
    setAccionActual('Generando resumen y abstract final...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      const datosGenerador = prepararDatosGenerador();
      const data = await generarResumenFinal(datosGenerador);
      console.log('Respuesta /generar-resumen-final:', data);
      setUltimoResultado(data);

      const rutaFinal =
        data.ruta_articulo_final ||
        data.archivo ||
        data.ruta_archivo ||
        '';

      if (rutaFinal) {
        setRutaArticuloFinal(rutaFinal);
      }

      setMensaje(
        `✅ Resumen final generado.\nArtículo final (etapa 7): ${
          rutaFinal || 'ver consola'
        }\n💾 Ruta de artículo final guardada para integración.`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  // Integrar 7 etapas (nuevo endpoint)
  const handleIntegrar7Etapas = async (e) => {
    e.preventDefault();
    setAccionActual('Integrando las 7 etapas en un solo documento...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      if (!rutaReferencias || !rutaArticuloFinal) {
        setIsLoading(false);
        setAccionActual('');
        setMensaje(
          '⚠️ Para integrar las 7 etapas necesitas primero:\n' +
          '- Generar REFERENCIAS (botón 2) y\n' +
          '- Generar RESUMEN FINAL (botón 6)\n' +
          'Vuelve a ejecutar esas etapas y se guardarán las rutas automáticamente.'
        );
        return;
      }

      const data = await integrar7Etapas(rutaArticuloFinal, rutaReferencias);
      console.log('Respuesta /integrar-7-etapas:', data);
      setUltimoResultado(data);

      setMensaje(
        `✅ Documento integrado (7 etapas) generado.\n` +
        `Artículo base final: ${data.ruta_base_final || 'ver consola'}\n` +
        `Referencias usadas: ${data.ruta_referencias_doc || 'ver consola'}\n` +
        `📄 Documento integrado: ${data.ruta_doc_integrado || 'ver consola'}`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  // Pipeline completo (todas las etapas)
  const handlePipelineCompleto = async (e) => {
    e.preventDefault();
    setAccionActual('Ejecutando pipeline completo (1–7)...');
    setIsLoading(true);
    setMensaje('');
    setUltimoResultado(null);

    try {
      const datosGenerador = prepararDatosGenerador();
      const data = await ejecutarPipelineCompleto(datosGenerador);
      console.log('Respuesta /pipeline-completo:', data);
      setUltimoResultado(data);

      const rutaFinal =
        data?.documento_integrado?.ruta_doc_integrado ||
        data?.resumen_final?.ruta_articulo_final ||
        'ver consola';

      setMensaje(
        `✅ Pipeline completo ejecutado.\nDocumento integrado: ${rutaFinal}`
      );
    } catch (error) {
      manejarError(error);
    } finally {
      setIsLoading(false);
      setAccionActual('');
    }
  };

  return (
    <div className="form-container">
      <h1>Generador de Artículos Científicos</h1>

      <form>
        <label>
          Nombre completo:
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          País:
          <select
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un país</option>
            {countries.map((pais, idx) => (
              <option key={idx} value={pais}>
                {pais}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo de artículo:
          <select
            name="tipoArticulo"
            value={formData.tipoArticulo}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione tipo</option>
            {articleTypes.map((tipo, idx) => (
              <option key={idx} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tema o intereses del artículo:
          <textarea
            name="tema"
            value={formData.tema}
            onChange={handleChange}
            placeholder="Describe de qué te gustaría que trate tu artículo, tu carrera o línea de investigación. Si no sabes, lo generamos por ti."
          />
        </label>

        {temaGenerado && (
          <p>
            <strong>Tema generado:</strong> {temaGenerado}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          {/*<button
            type="button"
            onClick={handleGenerarArticulo}
            disabled={isLoading}
          >
            1️⃣ Generar artículo base
          </button>

          <button
            type="button"
            onClick={handleGenerarReferencias}
            disabled={isLoading}
          >
            2️⃣ Generar referencias
          </button>

          <button
            type="button"
            onClick={handleBuscarArticulos}
            disabled={isLoading}
          >
            3️⃣ Generar doc. de búsqueda
          </button>

          <button
            type="button"
            onClick={handleGenerarMetodologiaPrisma}
            disabled={isLoading}
          >
            4️⃣ PRISMA + Metodología
          </button>

          <button
            type="button"
            onClick={handleGenerarDiscusionConclusion}
            disabled={isLoading}
          >
            5️⃣ Discusión + Conclusión
          </button>

          <button
            type="button"
            onClick={handleGenerarResumenFinal}
            disabled={isLoading}
          >
            6️⃣ Resumen final
          </button>

          <button
            type="button"
            onClick={handleIntegrar7Etapas}
            disabled={isLoading}
          >
            7️⃣ Integrar 7 etapas (modelo)
          </button>*/}

          <button
            type="button"
            onClick={handlePipelineCompleto}
            disabled={isLoading}
          >
            🚀 Pipeline completo (1–7)
          </button>
        </div>
      </form>

      {mensaje && (
        <pre
          style={{
            marginTop: '1rem',
            background: '#0f172a',
            color: '#a7f3d0',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            whiteSpace: 'pre-wrap',
            fontSize: '0.9rem',
          }}
        >
          {mensaje}
        </pre>
      )}

      {ultimoResultado && (
        <details style={{ marginTop: '0.75rem' }}>
          <summary>Ver respuesta completa de la última etapa</summary>
          <pre
            style={{
              marginTop: '0.5rem',
              background: '#111827',
              color: '#e5e7eb',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              whiteSpace: 'pre-wrap',
              fontSize: '0.8rem',
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(ultimoResultado, null, 2)}
          </pre>
        </details>
      )}

      {/* Overlay de carga global */}
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader-modal">
            <div className="spinner" />
            <p style={{ marginTop: '0.75rem', fontWeight: 500 }}>
              {accionActual || 'Procesando tu artículo...'}
            </p>
            <p
              style={{
                fontSize: '0.8rem',
                opacity: 0.8,
                marginTop: '0.25rem',
              }}
            >
              No cierres esta pestaña hasta que termine.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleForm;
