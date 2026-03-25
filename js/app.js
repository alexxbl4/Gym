import {
  state,
  setScreen,
  startNewRoutineDraft,
  editRoutineById,
  updateDraftName,
  addDraftExercise,
  removeDraftExercise,
  updateDraftExercise,
  addSetToExercise,
  removeSetFromExercise,
  updateSet,
  saveDraftRoutine,
  deleteRoutine,
  startSession,
  updateActiveSet,
  toggleActiveSetDone,
  finishSession,
  resetAllData,
} from './state.js';

import {
  showScreen,
  renderRoutines,
  renderEditor,
  renderTrainScreen,
  renderStats,
  showToast,
  showConfirm,
  bindConfirmEvents,
  initIcons,
  updateTrainTimer,
} from './ui.js';

const routineNameInput = document.getElementById('routine-name');
const newRoutineBtn = document.getElementById('new-routine-btn');
const backRoutinesBtn = document.getElementById('back-routines-btn');
const saveRoutineBtn = document.getElementById('save-routine-btn');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const routineList = document.getElementById('routine-list');
const exerciseList = document.getElementById('exercise-list');
const trainExerciseList = document.getElementById('train-exercise-list');
const bottomNav = document.getElementById('bottom-nav');
const finishSessionBtn = document.getElementById('finish-session-btn');
const resetAppBtn = document.getElementById('reset-app-btn');

let sessionInterval = null;
let sessionSeconds = 0;

function openScreen(name) {
  setScreen(name);
  showScreen(name);

  if (name === 'routines') renderRoutines();
  if (name === 'editor') renderEditor();
  if (name === 'train') renderTrainScreen();
  if (name === 'stats') renderStats();
}

function openEditorForNew() {
  startNewRoutineDraft();
  openScreen('editor');
}

function openEditorForEdit(id) {
  const ok = editRoutineById(id);
  if (!ok) {
    showToast('No se encontró la rutina');
    return;
  }

  openScreen('editor');
}

function handleSaveRoutine() {
  const result = saveDraftRoutine();

  if (!result.ok) {
    showToast(`⚠️ ${result.error}`);
    return;
  }

  showToast('✅ Rutina guardada');
  openScreen('routines');
}

function handleStartSession(routineId) {
  const result = startSession(routineId);

  if (!result.ok) {
    showToast(`⚠️ ${result.error}`);
    return;
  }

  clearInterval(sessionInterval);
  sessionSeconds = 0;
  updateTrainTimer(sessionSeconds);
  sessionInterval = setInterval(() => {
    sessionSeconds += 1;
    updateTrainTimer(sessionSeconds);
  }, 1000);

  renderTrainScreen();
  openScreen('train');
  showToast('💪 Entrenamiento iniciado');
}

function handleFinishSession() {
  if (!state.activeSession) {
    showToast('No hay sesión activa');
    return;
  }

  showConfirm({
    title: 'Finalizar sesión',
    body: 'Se guardará en tu historial.',
    onConfirm: () => {
      clearInterval(sessionInterval);
      const result = finishSession(sessionSeconds);
      sessionSeconds = 0;
      updateTrainTimer(0);
      renderTrainScreen();
      renderStats();

      if (result.ok) {
        showToast(`✅ Guardado · ${result.completedSets} series`);
        openScreen('stats');
      } else {
        showToast('⚠️ No se pudo guardar la sesión');
      }
    },
  });
}

function bindTopLevelEvents() {
  newRoutineBtn.addEventListener('click', openEditorForNew);
  backRoutinesBtn.addEventListener('click', () => openScreen('routines'));
  saveRoutineBtn.addEventListener('click', handleSaveRoutine);

  addExerciseBtn.addEventListener('click', () => {
    addDraftExercise();
    renderEditor();
  });

  routineNameInput.addEventListener('input', e => {
    updateDraftName(e.target.value);
  });

  finishSessionBtn.addEventListener('click', handleFinishSession);

  resetAppBtn.addEventListener('click', () => {
    showConfirm({
      title: 'Borrar datos',
      body: 'Eliminarás rutinas y estadísticas guardadas en este navegador.',
      onConfirm: () => {
        resetAllData();
        clearInterval(sessionInterval);
        sessionSeconds = 0;
        updateTrainTimer(0);
        renderRoutines();
        renderTrainScreen();
        renderStats();
        openScreen('routines');
        showToast('🗑️ Datos eliminados');
      },
    });
  });
}

function bindBottomNav() {
  bottomNav.addEventListener('click', e => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;
    openScreen(btn.dataset.screen);
  });
}

function bindRoutineListEvents() {
  routineList.addEventListener('click', e => {
    const card = e.target.closest('.routine-card');
    if (!card) return;

    const id = card.dataset.id;
    if (!id) return;

    if (e.target.closest('.action-train')) {
      handleStartSession(id);
      return;
    }

    if (e.target.closest('.action-edit')) {
      openEditorForEdit(id);
      return;
    }

    if (e.target.closest('.action-delete')) {
      showConfirm({
        title: 'Borrar rutina',
        body: 'Esta acción no se puede deshacer.',
        onConfirm: () => {
          const ok = deleteRoutine(id);
          if (ok) {
            renderRoutines();
            renderStats();
            showToast('🗑️ Rutina eliminada');
          } else {
            showToast('⚠️ No se pudo borrar');
          }
        },
      });
    }
  });
}

function bindExerciseListEvents() {
  exerciseList.addEventListener('input', e => {
    const card = e.target.closest('.exercise-card');
    if (!card) return;

    const exerciseId = card.dataset.exerciseId;
    if (!exerciseId) return;

    if (e.target.matches('.exercise-name')) {
      updateDraftExercise(exerciseId, { name: e.target.value });
      return;
    }

    if (e.target.matches('.exercise-rest')) {
      updateDraftExercise(exerciseId, { rest: Number(e.target.value) || 0 });
      return;
    }

    const row = e.target.closest('.set-row');
    if (row) {
      const setIndex = Number(row.dataset.setIndex);

      if (e.target.matches('.set-weight')) {
        updateSet(exerciseId, setIndex, 'weight', e.target.value);
      }

      if (e.target.matches('.set-reps')) {
        updateSet(exerciseId, setIndex, 'reps', e.target.value);
      }
    }
  });

  exerciseList.addEventListener('change', e => {
    const card = e.target.closest('.exercise-card');
    if (!card) return;

    const exerciseId = card.dataset.exerciseId;
    if (!exerciseId) return;

    if (e.target.matches('.exercise-cardio')) {
      updateDraftExercise(exerciseId, { cardio: e.target.checked });
    }
  });

  exerciseList.addEventListener('click', e => {
    const card = e.target.closest('.exercise-card');
    if (!card) return;

    const exerciseId = card.dataset.exerciseId;
    if (!exerciseId) return;

    if (e.target.closest('.action-remove-exercise')) {
      removeDraftExercise(exerciseId);
      renderEditor();
      return;
    }

    if (e.target.closest('.action-add-set')) {
      addSetToExercise(exerciseId);
      renderEditor();
      return;
    }

    if (e.target.closest('.action-remove-set')) {
      const row = e.target.closest('.set-row');
      if (!row) return;
      removeSetFromExercise(exerciseId, Number(row.dataset.setIndex));
      renderEditor();
    }
  });
}

function bindTrainEvents() {
  trainExerciseList.addEventListener('input', e => {
    const card = e.target.closest('.train-card');
    if (!card) return;

    const exerciseId = card.dataset.exerciseId;
    if (!exerciseId) return;

    const row = e.target.closest('.train-set-row');
    if (!row) return;

    const setIndex = Number(row.dataset.setIndex);

    if (e.target.matches('.train-set-weight')) {
      updateActiveSet(exerciseId, setIndex, 'weight', e.target.value);
    }

    if (e.target.matches('.train-set-reps')) {
      updateActiveSet(exerciseId, setIndex, 'reps', e.target.value);
    }
  });

  trainExerciseList.addEventListener('change', e => {
    const card = e.target.closest('.train-card');
    if (!card) return;

    const exerciseId = card.dataset.exerciseId;
    if (!exerciseId) return;

    const row = e.target.closest('.train-set-row');
    if (!row) return;

    const setIndex = Number(row.dataset.setIndex);

    if (e.target.matches('.train-set-done')) {
      toggleActiveSetDone(exerciseId, setIndex, e.target.checked);
    }
  });
}

function init() {
  bindConfirmEvents();
  bindTopLevelEvents();
  bindBottomNav();
  bindRoutineListEvents();
  bindExerciseListEvents();
  bindTrainEvents();
  initIcons();
  updateTrainTimer(0);
  openScreen('routines');
}

init();
