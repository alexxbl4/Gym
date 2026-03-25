import { DEFAULT_REST, CARDIO_KEYWORDS } from './constants.js';
import { loadRoutines, saveRoutines } from './storage.js';

export const state = {
  screen: 'main',
  routines: loadRoutines(),
  editingRoutineId: null,
  draftRoutine: createEmptyRoutine(),
};

export function createId() {
  return `id_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export function createSet() {
  return {
    weight: '',
    reps: '',
  };
}

export function createExercise(name = 'Ejercicio') {
  const lower = name.toLowerCase();
  const cardio = CARDIO_KEYWORDS.some(k => lower.includes(k));

  return {
    id: createId(),
    name,
    rest: DEFAULT_REST,
    cardio,
    sets: [createSet()],
  };
}

export function createEmptyRoutine() {
  return {
    id: createId(),
    name: '',
    exercises: [createExercise('Ejercicio 1')],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function setScreen(screen) {
  state.screen = screen;
}

export function startNewRoutineDraft() {
  state.editingRoutineId = null;
  state.draftRoutine = createEmptyRoutine();
}

export function editRoutineById(id) {
  const routine = state.routines[id];
  if (!routine) return false;

  state.editingRoutineId = id;
  state.draftRoutine = structuredClone(routine);
  return true;
}

export function updateDraftName(name) {
  state.draftRoutine.name = name;
  state.draftRoutine.updatedAt = new Date().toISOString();
}

export function addDraftExercise() {
  state.draftRoutine.exercises.push(createExercise(`Ejercicio ${state.draftRoutine.exercises.length + 1}`));
}

export function removeDraftExercise(exerciseId) {
  state.draftRoutine.exercises = state.draftRoutine.exercises.filter(ex => ex.id !== exerciseId);

  if (state.draftRoutine.exercises.length === 0) {
    state.draftRoutine.exercises.push(createExercise('Ejercicio 1'));
  }
}

export function updateDraftExercise(exerciseId, patch) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  Object.assign(exercise, patch);
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

  const duplicated = Object.values(state.routines).some(r => {
    if (state.editingRoutineId && r.id === state.editingRoutineId) return false;
    return r.name.trim().toLowerCase() === name.toLowerCase();
  });

  if (duplicated) {
    return { ok: false, error: 'Ya existe una rutina con ese nombre' };
  }

  const routineToSave = structuredClone(state.draftRoutine);
  routineToSave.name = name;
  routineToSave.updatedAt = new Date().toISOString();

  state.routines[routineToSave.id] = routineToSave;
  state.editingRoutineId = routineToSave.id;

  const saved = saveRoutines(state.routines);

  if (!saved) {
    return { ok: false, error: 'No se pudo guardar en este dispositivo' };
  }

  return { ok: true };
}

export function deleteRoutine(id) {
  if (!state.routines[id]) return false;

  delete state.routines[id];
  return saveRoutines(state.routines);
}
