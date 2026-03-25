import { CARDIO_KEYWORDS, DEFAULT_REST } from './constants.js';
import { clearAppData, loadAppData, saveAppData } from './storage.js';

function createId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function createSet() {
  return {
    weight: '',
    reps: '',
  };
}

function detectCardio(name = '') {
  const lower = name.toLowerCase();
  return CARDIO_KEYWORDS.some(k => lower.includes(k));
}

function createExercise(name = 'Ejercicio 1') {
  return {
    id: createId('ex'),
    name,
    rest: DEFAULT_REST,
    cardio: detectCardio(name),
    sets: [createSet()],
  };
}

function createRoutine() {
  return {
    id: createId('rt'),
    name: '',
    exercises: [createExercise()],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const persisted = loadAppData();

export const state = {
  screen: 'routines',
  routines: persisted.routines || {},
  logs: persisted.logs || [],
  editingRoutineId: null,
  draftRoutine: createRoutine(),
  activeSession: null,
};

function persist() {
  return saveAppData({
    _schemaVersion: 3,
    routines: state.routines,
    logs: state.logs,
  });
}

export function setScreen(screen) {
  state.screen = screen;
}

export function getRoutinesArray() {
  return Object.values(state.routines).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}

export function startNewRoutineDraft() {
  state.editingRoutineId = null;
  state.draftRoutine = createRoutine();
}

export function editRoutineById(id) {
  const routine = state.routines[id];
  if (!routine) return false;

  state.editingRoutineId = id;
  state.draftRoutine = structuredClone({
    id: routine.id || id,
    name: routine.name || '',
    exercises: Array.isArray(routine.exercises) && routine.exercises.length
      ? routine.exercises
      : [createExercise()],
    createdAt: routine.createdAt || new Date().toISOString(),
    updatedAt: routine.updatedAt || new Date().toISOString(),
  });

  return true;
}

export function updateDraftName(name) {
  state.draftRoutine.name = name;
  state.draftRoutine.updatedAt = new Date().toISOString();
}

export function addDraftExercise() {
  const nextNumber = state.draftRoutine.exercises.length + 1;
  state.draftRoutine.exercises.push(createExercise(`Ejercicio ${nextNumber}`));
}

export function removeDraftExercise(exerciseId) {
  state.draftRoutine.exercises = state.draftRoutine.exercises.filter(ex => ex.id !== exerciseId);

  if (state.draftRoutine.exercises.length === 0) {
    state.draftRoutine.exercises.push(createExercise());
  }
}

export function updateDraftExercise(exerciseId, patch) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  Object.assign(exercise, patch);

  if ('name' in patch && !('cardio' in patch)) {
    exercise.cardio = detectCardio(exercise.name);
  }

  state.draftRoutine.updatedAt = new Date().toISOString();
}

export function addSetToExercise(exerciseId) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  exercise.sets.push(createSet());
  state.draftRoutine.updatedAt = new Date().toISOString();
}

export function removeSetFromExercise(exerciseId, setIndex) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  exercise.sets.splice(setIndex, 1);

  if (exercise.sets.length === 0) {
    exercise.sets.push(createSet());
  }

  state.draftRoutine.updatedAt = new Date().toISOString();
}

export function updateSet(exerciseId, setIndex, field, value) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (!exercise || !exercise.sets[setIndex]) return;

  exercise.sets[setIndex][field] = value;
  state.draftRoutine.updatedAt = new Date().toISOString();
}

export function saveDraftRoutine() {
  const name = state.draftRoutine.name.trim();

  if (!name) {
    return { ok: false, error: 'Ponle nombre a la rutina' };
  }

  const duplicated = Object.values(state.routines).some(routine => {
    if (state.editingRoutineId && routine.id === state.editingRoutineId) return false;
    return routine.name.trim().toLowerCase() === name.toLowerCase();
  });

  if (duplicated) {
    return { ok: false, error: 'Ya existe una rutina con ese nombre' };
  }

  const routineToSave = structuredClone(state.draftRoutine);
  routineToSave.name = name;
  routineToSave.updatedAt = new Date().toISOString();

  state.routines[routineToSave.id] = routineToSave;
  state.editingRoutineId = routineToSave.id;

  const ok = persist();
  return ok ? { ok: true } : { ok: false, error: 'No se pudo guardar' };
}

export function deleteRoutine(id) {
  if (!state.routines[id]) return false;
  delete state.routines[id];
  return persist();
}

export function startSession(routineId) {
  const routine = state.routines[routineId];
  if (!routine) return { ok: false, error: 'La rutina no existe' };

  state.activeSession = {
    id: createId('sess'),
    routineId: routine.id,
    routineName: routine.name,
    startedAt: new Date().toISOString(),
    exercises: routine.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      rest: ex.rest,
      cardio: ex.cardio,
      sets: ex.sets.map(setItem => ({
        weight: setItem.weight,
        reps: setItem.reps,
        done: false,
      })),
    })),
  };

  return { ok: true };
}

export function updateActiveSet(exerciseId, setIndex, field, value) {
  const exercise = state.activeSession?.exercises.find(ex => ex.id === exerciseId);
  if (!exercise || !exercise.sets[setIndex]) return;
  exercise.sets[setIndex][field] = value;
}

export function toggleActiveSetDone(exerciseId, setIndex, checked) {
  const exercise = state.activeSession?.exercises.find(ex => ex.id === exerciseId);
  if (!exercise || !exercise.sets[setIndex]) return;
  exercise.sets[setIndex].done = checked;
}

export function finishSession(durationSec) {
  if (!state.activeSession) return { ok: false };

  let completedSets = 0;
  let volume = 0;

  state.activeSession.exercises.forEach(exercise => {
    exercise.sets.forEach(setItem => {
      if (setItem.done) {
        completedSets += 1;
        const weight = Number(setItem.weight) || 0;
        const reps = Number(setItem.reps) || 0;
        volume += weight * reps;
      }
    });
  });

  state.logs.unshift({
    id: createId('log'),
    routineId: state.activeSession.routineId,
    routineName: state.activeSession.routineName,
    startedAt: state.activeSession.startedAt,
    endedAt: new Date().toISOString(),
    durationSec,
    completedSets,
    volume,
  });

  state.activeSession = null;
  const ok = persist();
  return { ok, completedSets, volume };
}

export function getStats() {
  const totalSessions = state.logs.length;
  const totalVolume = state.logs.reduce((sum, log) => sum + (Number(log.volume) || 0), 0);
  const totalSets = state.logs.reduce((sum, log) => sum + (Number(log.completedSets) || 0), 0);
  const totalMinutes = Math.round(
    state.logs.reduce((sum, log) => sum + (Number(log.durationSec) || 0), 0) / 60
  );

  return {
    totalRoutines: Object.keys(state.routines).length,
    totalSessions,
    totalVolume,
    totalSets,
    totalMinutes,
  };
}

export function resetAllData() {
  state.routines = {};
  state.logs = [];
  state.activeSession = null;
  state.editingRoutineId = null;
  state.draftRoutine = createRoutine();
  return clearAppData();
}
