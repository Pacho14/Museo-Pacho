/**
 * stations.js — Configuración modular de las 5 estaciones del Hub World
 * Incluye datos curatoriales para texto 3D integrado en el espacio.
 */

const STATIONS = [
  {
    id: 1,
    name: "ARDUINO BALANCIN",
    subtitle: "Robotica",
    description: "Francisco Mendoza\nArduino",
    angle: 0,
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
    id: 2,
    name: "VISUALIZACION FOTOREALISTA Y PROTOTIPADO DE JOYERIA",
    subtitle: "Modelado 3D",
    description: "Francisco Mendoza\nInmersión virtual",
    angle: 72,
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
    id: 3,
    name: "AVIONETA",
    subtitle: "Auto CAD",
    description: "Francisco Mendoza\nMdf",
    angle: 144,
    radius: 8,
    glb: "20_2_2026.glb",
    color: "#C7B89A",
    accentColor: "#6366F1",
    glowColor: "#818CF8",
    activity: {
      type: "bezier-game",
      label: "Desafío de Precisión Bézier"
    }
  },
  {
    id: 4,
    name: "LAMPARA FOGATA",
    subtitle: "Sistema de iluminación",
    description: "Francisco Mendoza\nABS (Plastico)",
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
    name: "WASA",
    subtitle: "Mobiliario",
    description: "Francisco Mendoza\nTuberia de Acero-MDP",
    angle: 288,
    radius: 8,
    glb: "14.glb",
    color: "#C8B8A2",
    accentColor: "#F59E0B",
    glowColor: "#FBBF24",
    activity: {
      type: "wasa-configurator",
      label: "Explorar Variantes WASA"
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
