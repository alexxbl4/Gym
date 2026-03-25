import { APP_SCHEMA_VERSION, CARDIO_KEYWORDS, DEFAULT_LIBRARY, DEFAULT_REST } from './constants.js';
import { clearAppData, loadAppData, normalizeImportedData, saveAppData } from './storage.js';

function createId(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`; }
function createSet() { return { weight: '', reps: '' }; }
function detectCardio(name = '') { return CARDIO_KEYWORDS.some(k => name.toLowerCase().includes(k)); }

function createExercise(name = 'Ejercicio 1') {
  return { id: createId('ex'), name, rest: DEFAULT_REST, cardio: detectCardio(name), sets: [createSet()] };
}

function createRoutine() {
  return { id: createId('rt'), name: '', exercises: [createExercise()], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

const persisted = loadAppData();

export const state = {
  screen: 'routines',
  routines: persisted.routines || {},
  logs: persisted.logs || [],
  customExercises: persisted.customExercises || [],
  editingRoutineId: null,
  draftRoutine: createRoutine(),
  activeSession: null,
  libraryQuery: '',
  libraryCategory: 'Todos',
  libraryTarget: 'editor',
  restTimer: { active: false, total: 0, remaining: 0 },
};

function persist() {
  return saveAppData({ _schemaVersion: APP_SCHEMA_VERSION, routines: state.routines, logs: state.logs, customExercises: state.customExercises });
}

function estimate1RM(weight, reps) {
  const w = Number(weight) || 0; const r = Number(reps) || 0;
  if (!w || !r) return 0;
  return w * (1 + r / 30);
}

export function setScreen(screen) { state.screen = screen; }
export function getRoutinesArray() { return Object.values(state.routines).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); }
export function getFullLibrary() { return [...DEFAULT_LIBRARY, ...state.customExercises]; }
export function setLibraryQuery(query) { state.libraryQuery = query.trim(); }
export function setLibraryCategory(category) { state.libraryCategory = category; }

export function getFilteredLibrary() {
  const q = state.libraryQuery.toLowerCase();
  return getFullLibrary().filter(item => {
    const catOk = state.libraryCategory === 'Todos' || item.cat === state.libraryCategory;
    const qOk = !q || item.name.toLowerCase().includes(q);
    return catOk && qOk;
  });
}

export function customExerciseExists(name) {
  const lower = name.trim().toLowerCase();
  return getFullLibrary().some(item => item.name.trim().toLowerCase() === lower);
}

export function saveCustomExercise(name, cat = 'Mis ejercicios') {
  const clean = name.trim();
  if (!clean) return { ok: false, error: 'Escribe un nombre' };
  if (customExerciseExists(clean)) return { ok: false, error: 'Ese ejercicio ya existe' };
  state.customExercises.push({ id: createId('cust'), name: clean, cat });
  return persist() ? { ok: true } : { ok: false, error: 'No se pudo guardar' };
}

export function addLibraryExerciseToDraft(name) { state.draftRoutine.exercises.push(createExercise(name)); }
export function startNewRoutineDraft() { state.editingRoutineId = null; state.draftRoutine = createRoutine(); }

export function editRoutineById(id) {
  const routine = state.routines[id];
  if (!routine) return false;
  state.editingRoutineId = id;
  state.draftRoutine = structuredClone({
    id: routine.id || id, name: routine.name || '',
    exercises: Array.isArray(routine.exercises) && routine.exercises.length ? routine.exercises : [createExercise()],
    createdAt: routine.createdAt || new Date().toISOString(),
    updatedAt: routine.updatedAt || new Date().toISOString(),
  });
  return true;
}

export function duplicateRoutine(id) {
  const routine = state.routines[id];
  if (!routine) return { ok: false, error: 'Rutina no encontrada' };
  let nextName = `${routine.name} copia`;
  let count = 2;
  while (Object.values(state.routines).some(item => item.name.trim().toLowerCase() === nextName.trim().toLowerCase())) {
    nextName = `${routine.name} copia ${count}`; count += 1;
  }
  const cloned = structuredClone(routine);
  cloned.id = createId('rt'); cloned.name = nextName;
  cloned.createdAt = new Date().toISOString(); cloned.updatedAt = new Date().toISOString();
  cloned.exercises = cloned.exercises.map(ex => ({ ...ex, id: createId('ex') }));
  state.routines[cloned.id] = cloned;
  return persist() ? { ok: true, id: cloned.id } : { ok: false, error: 'No se pudo duplicar' };
}

export function updateDraftName(name) { state.draftRoutine.name = name; state.draftRoutine.updatedAt = new Date().toISOString(); }
export function addDraftExercise() { state.draftRoutine.exercises.push(createExercise(`Ejercicio ${state.draftRoutine.exercises.length + 1}`)); }
export function removeDraftExercise(exerciseId) {
  state.draftRoutine.exercises = state.draftRoutine.exercises.filter(ex => ex.id !== exerciseId);
  if (state.draftRoutine.exercises.length === 0) state.draftRoutine.exercises.push(createExercise());
}
export function moveDraftExercise(exerciseId, direction) {
  const index = state.draftRoutine.exercises.findIndex(ex => ex.id === exerciseId);
  if (index === -1) return;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= state.draftRoutine.exercises.length) return;
  const arr = state.draftRoutine.exercises;
  [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
  state.draftRoutine.updatedAt = new Date().toISOString();
}
export function updateDraftExercise(exerciseId, patch) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;
  Object.assign(exercise, patch);
  if ('name' in patch && !('cardio' in patch)) exercise.cardio = detectCardio(exercise.name);
  state.draftRoutine.updatedAt = new Date().toISOString();
}
export function addSetToExercise(exerciseId) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (exercise) { exercise.sets.push(createSet()); state.draftRoutine.updatedAt = new Date().toISOString(); }
}
export function removeSetFromExercise(exerciseId, setIndex) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (!exercise) return;
  exercise.sets.splice(setIndex, 1);
  if (exercise.sets.length === 0) exercise.sets.push(createSet());
  state.draftRoutine.updatedAt = new Date().toISOString();
}
export function updateSet(exerciseId, setIndex, field, value) {
  const exercise = state.draftRoutine.exercises.find(ex => ex.id === exerciseId);
  if (exercise && exercise.sets[setIndex]) { exercise.sets[setIndex][field] = value; state.draftRoutine.updatedAt = new Date().toISOString(); }
}
export function saveDraftRoutine() {
  const name = state.draftRoutine.name.trim();
  if (!name) return { ok: false, error: 'Ponle nombre a la rutina' };
  const duplicated = Object.values(state.routines).some(routine => {
    if (state.editingRoutineId && routine.id === state.editingRoutineId) return false;
    return routine.name.trim().toLowerCase() === name.toLowerCase();
  });
  if (duplicated) return { ok: false, error: 'Ya existe una rutina con ese nombre' };
  const routineToSave = structuredClone(state.draftRoutine);
  routineToSave.name = name; routineToSave.updatedAt = new Date().toISOString();
  state.routines[routineToSave.id] = routineToSave;
  state.editingRoutineId = routineToSave.id;
  return persist() ? { ok: true } : { ok: false, error: 'No se pudo guardar' };
}
export function importBackupData(parsedBackup) {
  const data = parsedBackup?.data ?? parsedBackup;
  const normalized = normalizeImportedData(data);
  state.routines = normalized.routines || {};
  state.logs = normalized.logs || [];
  state.customExercises = normalized.customExercises || [];
  state.activeSession = null; state.editingRoutineId = null; state.draftRoutine = createRoutine();
  state.libraryCategory = 'Todos'; state.libraryQuery = '';
  stopRestTimer();
  return persist() ? { ok: true } : { ok: false, error: 'No se pudo importar' };
}
export function deleteRoutine(id) { if (!state.routines[id]) return false; delete state.routines[id]; return persist(); }
export function startSession(routineId) {
  const routine = state.routines[routineId];
  if (!routine) return { ok: false, error: 'La rutina no existe' };
  state.activeSession = {
    id: createId('sess'), routineId: routine.id, routineName: routine.name, startedAt: new Date().toISOString(),
    exercises: routine.exercises.map(ex => ({
      id: ex.id, name: ex.name, rest: ex.rest, cardio: ex.cardio,
      sets: ex.sets.map(setItem => ({ weight: setItem.weight, reps: setItem.reps, done: false }))
    })),
  };
  return { ok: true };
}
export function updateActiveSet(exerciseId, setIndex, field, value) {
  const exercise = state.activeSession?.exercises.find(ex => ex.id === exerciseId);
  if (exercise && exercise.sets[setIndex]) exercise.sets[setIndex][field] = value;
}
export function toggleActiveSetDone(exerciseId, setIndex, checked) {
  const exercise = state.activeSession?.exercises.find(ex => ex.id === exerciseId);
  if (exercise && exercise.sets[setIndex]) exercise.sets[setIndex].done = checked;
}
export function startRestTimer(seconds) { state.restTimer.active = true; state.restTimer.total = seconds; state.restTimer.remaining = seconds; }
export function tickRestTimer() { if (!state.restTimer.active) return; state.restTimer.remaining = Math.max(0, state.restTimer.remaining - 1); if (state.restTimer.remaining === 0) stopRestTimer(); }
export function adjustRestTimer(delta) { if (!state.restTimer.active) return; state.restTimer.remaining = Math.max(0, state.restTimer.remaining + delta); state.restTimer.total = Math.max(state.restTimer.remaining, 1); if (state.restTimer.remaining === 0) stopRestTimer(); }
export function stopRestTimer() { state.restTimer.active = false; state.restTimer.total = 0; state.restTimer.remaining = 0; }
function getPreviousExercisePRs(exerciseName) { return getExerciseDetail(exerciseName).prs; }
export function finishSession(durationSec) {
  if (!state.activeSession) return { ok: false };
  let completedSets = 0; let volume = 0; const exerciseDetails = []; const newPRs = [];
  state.activeSession.exercises.forEach(exercise => {
    let exerciseVolume = 0; let bestWeight = 0; let bestEstimated1RM = 0; let completedExerciseSets = 0;
    const doneSets = exercise.sets.filter(setItem => setItem.done).map(setItem => {
      const weight = Number(setItem.weight) || 0; const reps = Number(setItem.reps) || 0;
      completedSets += 1; completedExerciseSets += 1; volume += weight * reps; exerciseVolume += weight * reps;
      bestWeight = Math.max(bestWeight, weight); bestEstimated1RM = Math.max(bestEstimated1RM, estimate1RM(weight, reps));
      return { weight, reps, done: true };
    });
    if (doneSets.length > 0) {
      const prev = getPreviousExercisePRs(exercise.name);
      if (bestWeight > prev.bestWeight) newPRs.push({ name: exercise.name, type: 'Peso', value: bestWeight });
      if (exerciseVolume > prev.bestVolume) newPRs.push({ name: exercise.name, type: 'Volumen', value: exerciseVolume });
      if (bestEstimated1RM > prev.bestEstimated1RM) newPRs.push({ name: exercise.name, type: '1RM', value: Math.round(bestEstimated1RM) });
      exerciseDetails.push({ exerciseId: exercise.id, name: exercise.name, cardio: exercise.cardio, completedSets: completedExerciseSets, volume: exerciseVolume, bestWeight, bestEstimated1RM, sets: doneSets });
    }
  });
  state.logs.unshift({ id: createId('log'), routineId: state.activeSession.routineId, routineName: state.activeSession.routineName, startedAt: state.activeSession.startedAt, endedAt: new Date().toISOString(), durationSec, completedSets, volume, exercises: exerciseDetails });
  state.activeSession = null; stopRestTimer();
  return { ok: persist(), completedSets, volume, newPRs };
}
export function getStats() {
  const totalSessions = state.logs.length;
  const totalVolume = state.logs.reduce((sum, log) => sum + (Number(log.volume) || 0), 0);
  const totalSets = state.logs.reduce((sum, log) => sum + (Number(log.completedSets) || 0), 0);
  const totalMinutes = Math.round(state.logs.reduce((sum, log) => sum + (Number(log.durationSec) || 0), 0) / 60);
  return { totalRoutines: Object.keys(state.routines).length, totalSessions, totalVolume, totalSets, totalMinutes };
}
export function getExerciseProgressList() {
  const map = new Map();
  state.logs.forEach(log => {
    (log.exercises || []).forEach(exercise => {
      if (!map.has(exercise.name)) map.set(exercise.name, { name: exercise.name, sessions: 0, bestWeight: 0, bestVolume: 0, bestEstimated1RM: 0, lastDate: log.endedAt });
      const current = map.get(exercise.name);
      current.sessions += 1; current.bestWeight = Math.max(current.bestWeight, Number(exercise.bestWeight) || 0);
      current.bestVolume = Math.max(current.bestVolume, Number(exercise.volume) || 0);
      current.bestEstimated1RM = Math.max(current.bestEstimated1RM, Number(exercise.bestEstimated1RM) || 0);
      if (new Date(log.endedAt) > new Date(current.lastDate)) current.lastDate = log.endedAt;
    });
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
export function getExerciseDetail(name) {
  const history = state.logs.filter(log => (log.exercises || []).some(ex => ex.name === name)).map(log => {
    const exercise = log.exercises.find(ex => ex.name === name);
    return { date: log.endedAt, routineName: log.routineName, durationSec: log.durationSec, volume: Number(exercise.volume) || 0, bestWeight: Number(exercise.bestWeight) || 0, bestEstimated1RM: Number(exercise.bestEstimated1RM) || 0, completedSets: Number(exercise.completedSets) || 0, sets: exercise.sets || [] };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
  const prs = history.reduce((acc, item) => {
    acc.bestWeight = Math.max(acc.bestWeight, item.bestWeight); acc.bestVolume = Math.max(acc.bestVolume, item.volume);
    acc.bestEstimated1RM = Math.max(acc.bestEstimated1RM, item.bestEstimated1RM); acc.sessions += 1; return acc;
  }, { bestWeight: 0, bestVolume: 0, bestEstimated1RM: 0, sessions: 0 });
  return { name, prs, history };
}
export function resetAllData() {
  state.routines = {}; state.logs = []; state.customExercises = []; state.activeSession = null; state.editingRoutineId = null; state.draftRoutine = createRoutine(); state.libraryCategory = 'Todos'; state.libraryQuery = ''; stopRestTimer(); return clearAppData();
}
