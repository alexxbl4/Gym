export const APP_SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  app: 'moonpro_app_data_v1',
};

export const CARDIO_KEYWORDS = ['correr', 'cinta', 'bici', 'elíptica', 'remo', 'andar', 'saltar', 'comba'];
export const DEFAULT_REST = 90;

export const LIBRARY_CATEGORIES = ['Todos', 'Mis ejercicios', 'Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Core', 'Cardio'];

export const DEFAULT_LIBRARY = [
  // Pecho
  { name: 'Press Banca Plano', cat: 'Pecho' },
  { name: 'Press Banca Inclinado', cat: 'Pecho' },
  { name: 'Press Banca Declinado', cat: 'Pecho' },
  { name: 'Press Inclinado Mancuernas', cat: 'Pecho' },
  { name: 'Press Plano Mancuernas', cat: 'Pecho' },
  { name: 'Aperturas con Mancuernas', cat: 'Pecho' },
  { name: 'Aperturas en Polea', cat: 'Pecho' },
  { name: 'Cruces en Polea', cat: 'Pecho' },
  { name: 'Peck Deck (Máquina)', cat: 'Pecho' },
  { name: 'Fondos en Paralelas (Pecho)', cat: 'Pecho' },
  { name: 'Flexiones (Push-ups)', cat: 'Pecho' },

  // Espalda
  { name: 'Dominadas', cat: 'Espalda' },
  { name: 'Dominadas Supinas', cat: 'Espalda' },
  { name: 'Jalón al Pecho', cat: 'Espalda' },
  { name: 'Jalón al Pecho Agarre Estrecho', cat: 'Espalda' },
  { name: 'Remo con Barra', cat: 'Espalda' },
  { name: 'Remo Pendlay', cat: 'Espalda' },
  { name: 'Remo con Mancuerna', cat: 'Espalda' },
  { name: 'Remo en Polea Baja', cat: 'Espalda' },
  { name: 'Remo en Máquina', cat: 'Espalda' },
  { name: 'Pullover en Polea Alta', cat: 'Espalda' },
  { name: 'Peso Muerto Convencional', cat: 'Espalda' },

  // Pierna
  { name: 'Sentadilla Libre', cat: 'Pierna' },
  { name: 'Sentadilla Hack', cat: 'Pierna' },
  { name: 'Sentadilla Búlgara', cat: 'Pierna' },
  { name: 'Sentadilla Frontal', cat: 'Pierna' },
  { name: 'Prensa', cat: 'Pierna' },
  { name: 'Zancadas (Lunges)', cat: 'Pierna' },
  { name: 'Extensión de Cuádriceps', cat: 'Pierna' },
  { name: 'Peso Muerto Rumano', cat: 'Pierna' },
  { name: 'Curl Femoral Tumbado', cat: 'Pierna' },
  { name: 'Curl Femoral Sentado', cat: 'Pierna' },
  { name: 'Hip Thrust', cat: 'Pierna' },
  { name: 'Elevación de Talones (Gemelos)', cat: 'Pierna' },
  { name: 'Gemelos en Prensa', cat: 'Pierna' },

  // Hombro
  { name: 'Press Militar con Barra', cat: 'Hombro' },
  { name: 'Press Militar Mancuernas', cat: 'Hombro' },
  { name: 'Press Arnold', cat: 'Hombro' },
  { name: 'Elevaciones Laterales', cat: 'Hombro' },
  { name: 'Elevaciones Laterales en Polea', cat: 'Hombro' },
  { name: 'Elevaciones Frontales', cat: 'Hombro' },
  { name: 'Pájaros (Posterior con Mancuernas)', cat: 'Hombro' },
  { name: 'Face Pull', cat: 'Hombro' },
  { name: 'Encogimientos (Trapecio)', cat: 'Hombro' },

  // Brazo
  { name: 'Curl Bíceps Barra', cat: 'Brazo' },
  { name: 'Curl Bíceps Mancuernas', cat: 'Brazo' },
  { name: 'Curl Martillo', cat: 'Brazo' },
  { name: 'Curl en Banco Scott', cat: 'Brazo' },
  { name: 'Curl en Polea Baja', cat: 'Brazo' },
  { name: 'Extensión Tríceps Polea (Cuerda)', cat: 'Brazo' },
  { name: 'Extensión Tríceps Polea (Barra)', cat: 'Brazo' },
  { name: 'Press Francés', cat: 'Brazo' },
  { name: 'Patada de Tríceps', cat: 'Brazo' },
  { name: 'Fondos de Tríceps', cat: 'Brazo' },

  // Core (Abdominales)
  { name: 'Crunch Abdominal', cat: 'Core' },
  { name: 'Plancha (Plank)', cat: 'Core' },
  { name: 'Elevación de Piernas Colgado', cat: 'Core' },
  { name: 'Rueda Abdominal (Ab Wheel)', cat: 'Core' },
  { name: 'Russian Twists', cat: 'Core' },
  { name: 'Crunch en Polea', cat: 'Core' },

  // Cardio
  { name: 'Cinta de correr', cat: 'Cardio' },
  { name: 'Bicicleta Estática', cat: 'Cardio' },
  { name: 'Bicicleta Elíptica', cat: 'Cardio' },
  { name: 'Máquina de Remo', cat: 'Cardio' },
  { name: 'Salto a la Comba', cat: 'Cardio' },
  { name: 'Stairmaster (Escaleras)', cat: 'Cardio' }
];
