import { STORAGE_KEYS } from './constants.js';

function isStorageAvailable() {
  try {
    const testKey = '__moonpro_test__';
    localStorage.setItem(testKey, 'ok');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageReady = isStorageAvailable();

export function loadJSON(key, fallbackValue) {
  if (!storageReady) return fallbackValue;

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function saveJSON(key, value) {
  if (!storageReady) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadRoutines() {
  return loadJSON(STORAGE_KEYS.routines, {});
}

export function saveRoutines(routines) {
  return saveJSON(STORAGE_KEYS.routines, routines);
}
