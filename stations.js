/**
 * stations.js — Configuración modular de las 5 estaciones del Hub World
 * Incluye datos curatoriales para texto 3D integrado en el espacio.
 */

const STATIONS = [
  {
    id: 1,
    name: "Sala Memphiana",
    subtitle: "Colección principal",
    description: "Explora la colección central del Museo de Pacho.\nPiezas seleccionadas del acervo histórico\nque definen nuestra identidad cultural.",
    angle: 0,
    radius: 8,
    glb: null,
    color: "#C7B89A",
    accentColor: "#6366F1",
    glowColor: "#818CF8",
    activity: {
      type: "ar",
      label: "Explorar en Inmersión 3D"
    }
  },
  {
    id: 2,
    name: "Sala Histórica",
    subtitle: "Archivo y memoria",
    description: "Documentos, fotografías y objetos\nque narran la historia local de Pacho\na través de generaciones.",
    angle: 72,
    radius: 8,
    glb: null,
    color: "#A8B5A2",
    accentColor: "#10B981",
    glowColor: "#34D399",
    activity: {
      type: "info",
      label: "Explorar en Inmersión 3D"
    }
  },
  {
    id: 3,
    name: "Sala Arte",
    subtitle: "Expresión contemporánea",
    description: "Obras de artistas locales y regionales\nen diálogo con el patrimonio,\ntradición y vanguardia reunidas.",
    angle: 144,
    radius: 8,
    glb: null,
    color: "#B8A8C8",
    accentColor: "#8B5CF6",
    glowColor: "#A78BFA",
    activity: {
      type: "gallery",
      label: "Explorar en Inmersión 3D"
    }
  },
  {
    id: 4,
    name: "Sala Naturaleza",
    subtitle: "Flora y biodiversidad",
    description: "La riqueza natural del municipio de Pacho:\nespecies, ecosistemas y conservación\nen un territorio vivo.",
    angle: 216,
    radius: 8,
    glb: "MEMPHIS3.glb",
    color: "#A2B5A4",
    accentColor: "#22C55E",
    glowColor: "#4ADE80",
    activity: {
      type: "ar",
      label: "Explorar en Inmersión 3D"
    }
  },
  {
    id: 5,
    name: "Sala Comunidad",
    subtitle: "Voces y territorios",
    description: "Testimonios, relatos y mapas\nde la comunidad que da vida al museo,\nhistorias que merecen ser contadas.",
    angle: 288,
    radius: 8,
    glb: null,
    color: "#C8B8A2",
    accentColor: "#F59E0B",
    glowColor: "#FBBF24",
    activity: {
      type: "video",
      label: "Explorar en Inmersión 3D"
    }
  }
];

// Calcular posiciones X/Z para cada estación
STATIONS.forEach(s => {
  const rad = (s.angle * Math.PI) / 180;
  s.posX = parseFloat((Math.sin(rad) * s.radius).toFixed(2));
  s.posZ = parseFloat((-Math.cos(rad) * s.radius).toFixed(2));
});

if (typeof module !== "undefined") module.exports = STATIONS;
