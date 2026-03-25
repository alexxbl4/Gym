import {
  state, setScreen, startNewRoutineDraft, editRoutineById, duplicateRoutine,
  updateDraftName, addDraftExercise, removeDraftExercise, moveDraftExercise,
  updateDraftExercise, addSetToExercise, removeSetFromExercise, updateSet,
  saveDraftRoutine, importBackupData, deleteRoutine, startSession,
  updateActiveSet, toggleActiveSetDone, finishSession, resetAllData,
  setLibraryQuery, setLibraryCategory, addLibraryExerciseToDraft,
  saveCustomExercise, startRestTimer, tickRestTimer, adjustRestTimer, stopRestTimer
} from './state.js';

import { exportAppData } from './storage.js';

import {
  showScreen, renderRoutines, renderEditor, renderTrainScreen, renderStats,
  renderLibrary, openLibraryModal, closeLibraryModal, openExerciseDetailModal,
  closeExerciseDetailModal, renderRestTimer, showToast, showConfirm,
  bindConfirmEvents, initIcons, updateTrainTimer,
  currentCalDate, renderCalendar, showSummaryModal, closeSummaryModal
} from './ui.js';

const els = {
  routineNameInput: document.getElementById('routine-name'),
  newRoutineBtn: document.getElementById('new-routine-btn'),
  backRoutinesBtn: document.getElementById('back-routines-btn'),
  saveRoutineBtn: document.getElementById('save-routine-btn'),
  addExerciseBtn: document.getElementById('add-exercise-btn'),
  openLibraryBtn: document.getElementById('open-library-btn'),
  closeLibraryBtn: document.getElementById('close-library-btn'),
  saveCustomExBtn: document.getElementById('save-custom-ex-btn'),
  closeDetailBtn: document.getElementById('close-detail-btn'),
  exportBackupBtn: document.getElementById('export-backup-btn'),
  importBackupInput: document.getElementById('import-backup-input'),
  routineList: document.getElementById('routine-list'),
  exerciseList: document.getElementById('exercise-list'),
  trainExerciseList: document.getElementById('train-exercise-list'),
  exerciseProgressList: document.getElementById('exercise-progress-list'),
  bottomNav: document.getElementById('bottom-nav'),
  finishSessionBtn: document.getElementById('finish-session-btn'),
  resetAppBtn: document.getElementById('reset-app-btn'),
  librarySearch: document.getElementById('library-search'),
  libraryCats: document.getElementById('library-cats'),
  libraryList: document.getElementById('library-list'),
  restMinusBtn: document.getElementById('rest-minus-btn'),
  restPlusBtn: document.getElementById('rest-plus-btn'),
  restSkipBtn: document.getElementById('rest-skip-btn'),
  calPrev: document.getElementById('cal-prev'),
  calNext: document.getElementById('cal-next'),
  closeSummaryBtn: document.getElementById('close-summary-btn')
};

let sessionInterval = null; let sessionSeconds = 0; let restInterval = null;

function openScreen(name) {
  setScreen(name); showScreen(name);
  if (name === 'routines') renderRoutines(); if (name === 'editor') renderEditor();
  if (name === 'train') renderTrainScreen(); if (name === 'stats') renderStats();
}

function handleStartSession(routineId) {
  const result = startSession(routineId);
  if (!result.ok) { showToast(`⚠️ ${result.error}`); return; }
  clearInterval(sessionInterval); sessionSeconds = 0; updateTrainTimer(sessionSeconds);
  sessionInterval = setInterval(() => { sessionSeconds++; updateTrainTimer(sessionSeconds); }, 1000);
  stopRestFlow(); renderTrainScreen(); openScreen('train'); showToast('💪 Entrenamiento iniciado');
}

function handleFinishSession() {
  if (!state.activeSession) return;
  showConfirm({
    title: 'Finalizar sesión', body: 'Se guardará en tu historial.',
    onConfirm: () => {
      clearInterval(sessionInterval); stopRestFlow();
      const rName = state.activeSession.routineName; const rTime = sessionSeconds;
      const result = finishSession(sessionSeconds);
      sessionSeconds = 0; updateTrainTimer(0); renderTrainScreen(); renderStats();
      if (result.ok) { showSummaryModal(rName, rTime, result.volume, result.completedSets, result.newPRs || []); }
      else { showToast('⚠️ Error al guardar'); }
    }
  });
}

function startRestFlow(seconds) {
  stopRestFlow(); if (!seconds || seconds <= 0) return;
  startRestTimer(seconds); renderRestTimer();
  restInterval = setInterval(() => {
    tickRestTimer(); renderRestTimer();
    if (!state.restTimer.active) { clearInterval(restInterval); showToast('⏱️ Descanso terminado', 1800); }
  }, 1000);
}

function stopRestFlow() { clearInterval(restInterval); stopRestTimer(); renderRestTimer(); }

function bindEvents() {
  els.newRoutineBtn.addEventListener('click', () => { startNewRoutineDraft(); openScreen('editor'); });
  els.backRoutinesBtn.addEventListener('click', () => openScreen('routines'));
  els.saveRoutineBtn.addEventListener('click', () => {
    const r = saveDraftRoutine(); if(r.ok) { showToast('✅ Guardado'); openScreen('routines'); } else showToast(`⚠️ ${r.error}`);
  });
  els.addExerciseBtn.addEventListener('click', () => { addDraftExercise(); renderEditor(); });
  els.openLibraryBtn.addEventListener('click', () => { state.libraryTarget = 'editor'; renderLibrary(); openLibraryModal(); });
  els.closeLibraryBtn.addEventListener('click', closeLibraryModal);
  els.closeDetailBtn.addEventListener('click', closeExerciseDetailModal);
  els.closeSummaryBtn.addEventListener('click', () => { closeSummaryModal(); openScreen('stats'); });
  els.calPrev.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendar(); });
  els.calNext.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendar(); });

  els.exportBackupBtn.addEventListener('click', () => {
    try {
      const backup = exportAppData(); const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `moonpro.json`; a.click();
    } catch { showToast('⚠️ Error'); }
  });

  els.importBackupInput.addEventListener('change', e => {
    const file = e.target.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { if(importBackupData(JSON.parse(reader.result)).ok) { clearInterval(sessionInterval); stopRestFlow(); openScreen('routines'); showToast('✅ Importado'); } } catch { showToast('⚠️ Archivo inválido'); } e.target.value = '';
    }; reader.readAsText(file);
  });

  els.routineNameInput.addEventListener('input', e => updateDraftName(e.target.value));
  els.finishSessionBtn.addEventListener('click', handleFinishSession);
  
  els.resetAppBtn.addEventListener('click', () => {
    showConfirm({ title:'Borrar datos', body:'No se puede deshacer.', onConfirm: () => {
      resetAllData(); clearInterval(sessionInterval); stopRestFlow(); openScreen('routines'); showToast('🗑️ Borrado');
      setTimeout(() => location.reload(), 1000); 
    }});
  });

  els.restMinusBtn.addEventListener('click', () => adjustRestTimer(-15));
  els.restPlusBtn.addEventListener('click', () => adjustRestTimer(15));
  els.restSkipBtn.addEventListener('click', () => { stopRestFlow(); showToast('⏭️ Saltado'); });

  els.bottomNav.addEventListener('click', e => { const btn = e.target.closest('.nav-item'); if (btn) openScreen(btn.dataset.screen); });

  els.routineList.addEventListener('click', e => {
    const id = e.target.closest('.routine-card')?.dataset.id; if(!id) return;
    if (e.target.closest('.action-train')) handleStartSession(id);
    if (e.target.closest('.action-edit')) { editRoutineById(id); openScreen('editor'); }
    if (e.target.closest('.action-duplicate')) { duplicateRoutine(id); renderRoutines(); }
    if (e.target.closest('.action-delete')) { showConfirm({ title:'Borrar', body:'', onConfirm:()=> { deleteRoutine(id); renderRoutines(); }}); }
  });

  els.exerciseList.addEventListener('input', e => {
    const exId = e.target.closest('.exercise-card')?.dataset.exerciseId; if(!exId) return;
    if(e.target.matches('.exercise-name')) updateDraftExercise(exId, {name: e.target.value});
    if(e.target.matches('.exercise-rest')) updateDraftExercise(exId, {rest: Number(e.target.value)||0});
    const row = e.target.closest('.set-row');
    if(row) {
      const idx = Number(row.dataset.setIndex);
      if(e.target.matches('.set-weight')) updateSet(exId, idx, 'weight', e.target.value);
      if(e.target.matches('.set-reps')) updateSet(exId, idx, 'reps', e.target.value);
    }
  });

  els.exerciseList.addEventListener('click', e => {
    const exId = e.target.closest('.exercise-card')?.dataset.exerciseId; if(!exId) return;
    if(e.target.closest('.action-move-up')) { moveDraftExercise(exId, 'up'); renderEditor(); }
    if(e.target.closest('.action-move-down')) { moveDraftExercise(exId, 'down'); renderEditor(); }
    if(e.target.closest('.action-remove-exercise')) { removeDraftExercise(exId); renderEditor(); }
    if(e.target.closest('.action-add-set')) { addSetToExercise(exId); renderEditor(); }
    if(e.target.closest('.action-remove-set')) { removeSetFromExercise(exId, Number(e.target.closest('.set-row').dataset.setIndex)); renderEditor(); }
  });

  els.trainExerciseList.addEventListener('input', e => {
    const exId = e.target.closest('.train-card')?.dataset.exerciseId; const idx = Number(e.target.closest('.train-set-row')?.dataset.setIndex);
    if(!exId || isNaN(idx)) return;
    if(e.target.matches('.train-set-weight')) updateActiveSet(exId, idx, 'weight', e.target.value);
    if(e.target.matches('.train-set-reps')) updateActiveSet(exId, idx, 'reps', e.target.value);
  });

  els.trainExerciseList.addEventListener('change', e => {
    if(e.target.matches('.train-set-done')) {
      const exId = e.target.closest('.train-card').dataset.exerciseId; const idx = Number(e.target.closest('.train-set-row').dataset.setIndex);
      toggleActiveSetDone(exId, idx, e.target.checked);
      if(e.target.checked) startRestFlow(state.activeSession.exercises.find(ex=>ex.id===exId)?.rest || 90);
      renderTrainScreen();
    }
  });

  els.exerciseProgressList.addEventListener('click', e => {
    const name = e.target.closest('.history-item')?.dataset.exerciseName; if(name) openExerciseDetailModal(name);
  });

  // ==========================================
  // EVENTOS DE LA BIBLIOTECA (¡Los que faltaban!)
  // ==========================================
  els.librarySearch.addEventListener('input', e => {
    setLibraryQuery(e.target.value);
    renderLibrary();
  });

  els.libraryCats.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    setLibraryCategory(btn.dataset.cat);
    renderLibrary();
  });

  els.libraryList.addEventListener('click', e => {
    const card = e.target.closest('.library-item');
    if (!card) return;
    if (e.target.closest('.action-library-add')) {
      addLibraryExerciseToDraft(card.dataset.name);
      renderEditor();
      closeLibraryModal();
      showToast('✅ Ejercicio añadido');
    }
  });
}

function init() { bindConfirmEvents(); bindEvents(); initIcons(); openScreen('routines'); }
init();
