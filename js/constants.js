export const APP_SCHEMA_VERSION = 2; // Subimos a v2 por el cambio de trackType

export const STORAGE_KEYS = {
  app: 'moonpro_app_data_v2',
};

export const DEFAULT_REST = 90;

export const LIBRARY_CATEGORIES = [
  'Todos', 'Mis ejercicios', 'Pecho', 'Espalda', 'Pierna', 
  'Hombro', 'Brazo', 'Core', 'Calistenia', 'Cardio', 'Boxeo'
];

export const DEFAULT_LIBRARY = [
  // Pecho
  { name: 'Press Banca Plano', cat: 'Pecho', trackType: 'weight_reps' },
  { name: 'Press Banca Inclinado', cat: 'Pecho', trackType: 'weight_reps' },
  { name: 'Aperturas con Mancuernas', cat: 'Pecho', trackType: 'weight_reps' },
  { name: 'Cruces en Polea', cat: 'Pecho', trackType: 'weight_reps' },
  { name: 'Peck Deck (Máquina)', cat: 'Pecho', trackType: 'weight_reps' },

  // Espalda
  { name: 'Jalón al Pecho', cat: 'Espalda', trackType: 'weight_reps' },
  { name: 'Remo con Barra', cat: 'Espalda', trackType: 'weight_reps' },
  { name: 'Remo con Mancuerna', cat: 'Espalda', trackType: 'weight_reps' },
  { name: 'Remo Gironda', cat: 'Espalda', trackType: 'weight_reps' },
  { name: 'Pullover en Polea', cat: 'Espalda', trackType: 'weight_reps' },
  { name: 'Peso Muerto Convencional', cat: 'Espalda', trackType: 'weight_reps' },

  // Pierna
  { name: 'Sentadilla Libre', cat: 'Pierna', trackType: 'weight_reps' },
  { name: 'Prensa', cat: 'Pierna', trackType: 'weight_reps' },
  { name: 'Sentadilla Búlgara', cat: 'Pierna', trackType: 'weight_reps' },
  { name: 'Extensión de Cuádriceps', cat: 'Pierna', trackType: 'weight_reps' },
  { name: 'Peso Muerto Rumano', cat: 'Pierna', trackType: 'weight_reps' },
  { name: 'Curl Femoral Tumbado', cat: 'Pierna', trackType: 'weight_reps' },
  { name: 'Hip Thrust', cat: 'Pierna', trackType: 'weight_reps' },
  { name: 'Elevación de Gemelos', cat: 'Pierna', trackType: 'weight_reps' },

  // Hombro
  { name: 'Press Militar', cat: 'Hombro', trackType: 'weight_reps' },
  { name: 'Elevaciones Laterales', cat: 'Hombro', trackType: 'weight_reps' },
  { name: 'Elevaciones Frontales', cat: 'Hombro', trackType: 'weight_reps' },
  { name: 'Pájaros (Posterior)', cat: 'Hombro', trackType: 'weight_reps' },
  { name: 'Face Pull', cat: 'Hombro', trackType: 'weight_reps' },

  // Brazo
  { name: 'Curl Bíceps Barra', cat: 'Brazo', trackType: 'weight_reps' },
  { name: 'Curl Bíceps Mancuernas', cat: 'Brazo', trackType: 'weight_reps' },
  { name: 'Extensión Tríceps Polea', cat: 'Brazo', trackType: 'weight_reps' },
  { name: 'Press Francés', cat: 'Brazo', trackType: 'weight_reps' },

  // Core
  { name: 'Crunch Abdominal', cat: 'Core', trackType: 'reps_only' },
  { name: 'Crunch en Polea', cat: 'Core', trackType: 'weight_reps' },
  { name: 'Plancha (Plank)', cat: 'Core', trackType: 'time_only' },
  { name: 'Elevación de Piernas', cat: 'Core', trackType: 'reps_only' },
  { name: 'Rueda Abdominal', cat: 'Core', trackType: 'reps_only' },

  // Calistenia / Peso Corporal (Reps only)
  { name: 'Dominadas', cat: 'Calistenia', trackType: 'reps_only' },
  { name: 'Dominadas Supinas', cat: 'Calistenia', trackType: 'reps_only' },
  { name: 'Flexiones (Push-ups)', cat: 'Calistenia', trackType: 'reps_only' },
  { name: 'Fondos en Paralelas', cat: 'Calistenia', trackType: 'reps_only' },
  { name: 'Burpees', cat: 'Calistenia', trackType: 'reps_only' },
  { name: 'Muscle-ups', cat: 'Calistenia', trackType: 'reps_only' },
  
  // Lastrados
  { name: 'Dominadas Lastradas', cat: 'Espalda', trackType: 'weight_reps' },
  { name: 'Fondos Lastrados', cat: 'Pecho', trackType: 'weight_reps' },

  // Cardio (Time only)
  { name: 'Cinta de correr', cat: 'Cardio', trackType: 'time_only' },
  { name: 'Bicicleta Estática', cat: 'Cardio', trackType: 'time_only' },
  { name: 'Elíptica', cat: 'Cardio', trackType: 'time_only' },
  { name: 'Salto a la Comba', cat: 'Cardio', trackType: 'time_only' },

  // Boxeo (Time only)
  { name: 'Boxeo Saco', cat: 'Boxeo', trackType: 'time_only' },
  { name: 'Sombra de Boxeo', cat: 'Boxeo', trackType: 'time_only' },
  { name: 'Manoplas', cat: 'Boxeo', trackType: 'time_only' },
  { name: 'Sparring', cat: 'Boxeo', trackType: 'time_only' }
];

export function getTrackTypeOptions() {
  return [
    { value: 'weight_reps', label: 'Peso + Reps' },
    { value: 'reps_only', label: 'Solo Reps' },
    { value: 'time_only', label: 'Tiempo (Min:Seg)' }
  ];
}
