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
} from './state.js';

import {
  showScreen,
  renderRoutines,
  renderEditor,
  showToast,
  showConfirm,
  closeConfirm,
  bindConfirmEvents,
  initIcons,
} from './ui.js';

const routineNameInput = document.getElementById('routine-name');
const newRoutineBtn = document.getElementById('new-routine-btn');
const backMainBtn = document.getElementById('back-main-btn');
const saveRoutineBtn = document.getElementById('save-routine-btn');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const routineList = document.getElementById('routine-list');
const exerciseList = document.getElementById('exercise-list');

function openMain() {
  setScreen('main');
  showScreen('main');
  renderRoutines();
}

function openEditorForNew() {
  startNewRoutineDraft();
  setScreen('editor');
  showScreen('editor');
  renderEditor();
}

function openEditorForEdit(id) {
  const ok = editRoutineById(id);
  if (!ok) {
    showToast('No se encontró la rutina');
    return;
  }

  setScreen('editor');
  showScreen('editor');
  renderEditor();
}

function handleSaveRoutine() {
  const result = saveDraftRoutine();

  if (!result.ok) {
    showToast(`⚠️ ${result.error}`);
    return;
  }

  showToast('✅ Rutina guardada');
  openMain();
}

function bindTopLevelEvents() {
  newRoutineBtn.addEventListener('click', openEditorForNew);

  backMainBtn.addEventListener('click', openMain);

  saveRoutineBtn.addEventListener('click', handleSaveRoutine);

  addExerciseBtn.addEventListener('click', () => {
    addDraftExercise();
    renderEditor();
  });

  routineNameInput.addEventListener('input', e => {
    updateDraftName(e.target.value);
  });
}

function bindRoutineListEvents() {
  routineList.addEventListener('click', e => {
    const card = e.target.closest('.routine-card');
    if (!card) return;

    const id = card.dataset.id;
    if (!id) return;

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

function init() {
  bindConfirmEvents();
  bindTopLevelEvents();
  bindRoutineListEvents();
  bindExerciseListEvents();
  initIcons();

  if (state.screen === 'main') {
    openMain();
  } else {
    showScreen('main');
    renderRoutines();
  }

  window.closeConfirm = closeConfirm;
}

init();
