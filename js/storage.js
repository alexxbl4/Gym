import { APP_SCHEMA_VERSION, STORAGE_KEYS } from './constants.js';

function isStorageAvailable() {
  try {
    const testKey = '__moonpro_test__';
    localStorage.setItem(testKey, 'ok');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

const storageReady = isStorageAvailable();

function createEmptyAppData() {
  return {
    _schemaVersion: APP_SCHEMA_VERSION,
    routines: {},
    logs: [],
    customExercises: []
  };
}

function normalizeExercise(exercise, fallbackId) {
  return {
    id: exercise?.id || fallbackId,
    name: exercise?.name || 'Ejercicio',
    rest: Number(exercise?.rest ?? 90),
    trackType: exercise?.trackType || 'weight_reps',
    sets: Array.isArray(exercise?.sets) && exercise.sets.length > 0
      ? exercise.sets.map(setItem => ({
          weight: setItem?.weight ?? '',
          reps: setItem?.reps ?? '',
          timeMins: setItem?.timeMins ?? '',
          timeSecs: setItem?.timeSecs ?? ''
        }))
      : [{ weight: '', reps: '', timeMins: '', timeSecs: '' }]
  };
}

function normalizeRoutine(routine, key) {
  const exercises = Array.isArray(routine?.exercises) ? routine.exercises : [];
  return {
    id: routine?.id || key,
    name: routine?.name || 'Rutina',
    exercises: exercises.map((ex, index) => normalizeExercise(ex, `${key}_ex_${index + 1}`)),
    createdAt: routine?.createdAt || new Date().toISOString(),
    updatedAt: routine?.updatedAt || new Date().toISOString()
  };
}

function normalizeLog(log, index) {
  return {
    id: log?.id || `log_${index + 1}`,
    routineId: log?.routineId || '',
    routineName: log?.routineName || 'Rutina',
    startedAt: log?.startedAt || new Date().toISOString(),
    endedAt: log?.endedAt || new Date().toISOString(),
    durationSec: Number(log?.durationSec || 0),
    completedSets: Number(log?.completedSets || 0),
    volume: Number(log?.volume || 0),
    totalReps: Number(log?.totalReps || 0),
    totalTimeSecs: Number(log?.totalTimeSecs || 0),
    exercises: Array.isArray(log?.exercises) ? log.exercises : []
  };
}

function normalizeCustomExercise(item, index) {
  return {
    id: item?.id || `cust_${index + 1}`,
    name: item?.name || 'Ejercicio',
    cat: item?.cat || 'Mis ejercicios',
    trackType: item?.trackType || 'weight_reps'
  };
}

export function normalizeImportedData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return createEmptyAppData();
  }

  if (rawData._schemaVersion || rawData.routines || rawData.logs || rawData.customExercises) {
    const rawRoutines = rawData.routines || {};
    const routinesEntries = Object.entries(rawRoutines).map(([key, routine]) => [key, normalizeRoutine(routine, key)]);
    
    return {
      _schemaVersion: APP_SCHEMA_VERSION,
      routines: Object.fromEntries(routinesEntries),
      logs: Array.isArray(rawData.logs) ? rawData.logs.map((log, i) => normalizeLog(log, i)) : [],
      customExercises: Array.isArray(rawData.customExercises) ? rawData.customExercises.map((ex, i) => normalizeCustomExercise(ex, i)) : []
    };
  }

  const maybeOldRoutines = rawData;
  const routinesEntries = Object.entries(maybeOldRoutines).map(([key, routine]) => [key, normalizeRoutine(routine, key)]);

  return {
    _schemaVersion: APP_SCHEMA_VERSION,
    routines: Object.fromEntries(routinesEntries),
    logs: [],
    customExercises: []
  };
}

export function loadAppData() {
  if (!storageReady) return createEmptyAppData();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.app);
    const parsed = raw ? JSON.parse(raw) : createEmptyAppData();
    const migrated = normalizeImportedData(parsed);
    saveAppData(migrated);
    return migrated;
  } catch (e) {
    return createEmptyAppData();
  }
}

export function saveAppData(data) {
  if (!storageReady) return false;
  try {
    localStorage.setItem(STORAGE_KEYS.app, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export function clearAppData() {
  if (!storageReady) return false;
  try {
    localStorage.removeItem(STORAGE_KEYS.app);
    return true;
  } catch (e) {
    return false;
  }
}

export function exportAppData() {
  return {
    exportedAt: new Date().toISOString(),
    app: 'MoonPro',
    data: loadAppData()
  };
}
