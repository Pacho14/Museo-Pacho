/**
 * stations.js — Configuración modular de las 5 estaciones del Hub World
 * Incluye datos curatoriales para texto 3D integrado en el espacio.
 */

const STATIONS = [
  {
    id: 1,
    name: "Núcleo de Origen",
    subtitle: "Base Estelar Memphiana",
    description: "Inicia tu viaje en el centro de mando.\nAquí convergen los saberes fundamentales\nque impulsan nuestra exploración espacial.",
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
    name: "Archivo de Galaxias",
    subtitle: "Memoria del Tiempo",
    description: "Navega a través de los registros históricos.\nDocumentos y artefactos que narran el paso\nde nuestra civilización por el cosmos.",
    angle: 72,
    radius: 8,
    glb: "arduino 2.glb",
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
    name: "Nebulosa Creativa",
    subtitle: "Expresión sin Límites",
    description: "Adéntrate en nubes de color y forma.\nObras artísticas que desafían la gravedad\ny expanden nuestra percepción visual.",
    angle: 144,
    radius: 8,
    glb: "uploads_files_4601352_Diamond+ring.glb",
    color: "#B8A8C8",
    accentColor: "#8B5CF6",
    glowColor: "#A78BFA",
    activity: {
      type: "ring-tryon",
      label: "Probarse Anillo"
    }
  },
  {
    id: 4,
    name: "Bio-Dominio",
    subtitle: "Mundos Vivos",
    description: "Descubre la biodiversidad de planetas lejanos.\nSistemas ecológicos y vida orgánica\nen equilibrio con la tecnología avanzada.",
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
    name: "Alianza de Mundos",
    subtitle: "Conexión Universal",
    description: "El punto de encuentro de todas las voces.\nRelatos y testimonios que unen a los seres\nen este gran viaje de descubrimiento.",
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
