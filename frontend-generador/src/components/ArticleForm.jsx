import React, { useState } from 'react';

const countries = ['Perú', 'México', 'Colombia', 'Argentina', 'Chile'];
const articleTypes = ['LatIndex', 'SciELO', 'Scopus Q3–Q4', 'Scopus Q1–Q2'];
const sugerencias = {
      'Perú': {
        'LatIndex': ['Educación rural en el Perú y sus desafíos'],
        'Scopus Q1–Q2': ['Desarrollo de energías renovables en los Andes peruanos'],
        'default': ['Impacto ambiental de la minería en zonas rurales del Perú']
      },
      'México': {
        'SciELO': ['Didáctica en comunidades indígenas del sur de México'],
        'Scopus Q3–Q4': ['Contaminación del aire en la Ciudad de México y salud pública'],
        'default': ['Urbanización acelerada y calidad del aire']
      },
      'default': {
        'default': ['Desarrollo sostenible en Latinoamérica']
      }
    };

const ArticleForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    tipoArticulo: '',
    tema: '',
  });

  const [temaGenerado, setTemaGenerado] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

 const generarTemaAutomatico = () => {
  const pais = formData.pais || 'default';
  const tipo = formData.tipoArticulo || 'default';

  const temasPorPais = sugerencias[pais] || sugerencias['default'];
  const opciones = temasPorPais[tipo] || temasPorPais['default'] || sugerencias['default']['default'];

  return opciones[Math.floor(Math.random() * opciones.length)];
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  let temaFinal = formData.tema.trim().toLowerCase();
  if (!temaFinal || temaFinal === 'no sé' || temaFinal === 'nose' || temaFinal === 'no se') {
    const generado = generarTemaAutomatico();
    setTemaGenerado(generado);
    temaFinal = generado;
  } else {
    setTemaGenerado('');
  }

  const datosFinales = {
    ...formData,
    tema: temaFinal
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/generar-articulo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosFinales)
    });

    if (!response.ok) {
      throw new Error('Error al generar el artículo');
    }

    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    alert(`Artículo generado correctamente:\n\n${data.articulo || 'Revisa la consola'}`);
  } catch (error) {
    console.error('Error:', error);
    alert('Ocurrió un error al generar el artículo');
  }
};


  return (
    <div className="form-container">
      <h1>Generador de Artículos Científicos</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre completo:
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </label>

        <label>
          País:
          <select name="pais" value={formData.pais} onChange={handleChange} required>
            <option value="">Seleccione un país</option>
            {countries.map((pais, idx) => (
              <option key={idx} value={pais}>{pais}</option>
            ))}
          </select>
        </label>

        <label>
          Tipo de artículo:
          <select name="tipoArticulo" value={formData.tipoArticulo} onChange={handleChange} required>
            <option value="">Seleccione tipo</option>
            {articleTypes.map((tipo, idx) => (
              <option key={idx} value={tipo}>{tipo}</option>
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

        <button type="submit">Generar artículo</button>

        {temaGenerado && (
          <p><strong>Tema generado:</strong> {temaGenerado}</p>
        )}
      </form>
    </div>
  );
};

export default ArticleForm;
