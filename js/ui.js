import { getRoutinesArray, getStats, state } from './state.js';

const els = {
  screenRoutines: document.getElementById('screen-routines'),
  screenEditor: document.getElementById('screen-editor'),
  screenTrain: document.getElementById('screen-train'),
  screenStats: document.getElementById('screen-stats'),
  screenSettings: document.getElementById('screen-settings'),

  routineList: document.getElementById('routine-list'),
  routineName: document.getElementById('routine-name'),
  exerciseList: document.getElementById('exercise-list'),
  trainRoutineName: document.getElementById('train-routine-name'),
  trainTimer: document.getElementById('train-timer'),
  trainEmpty: document.getElementById('train-empty'),
  trainExerciseList: document.getElementById('train-exercise-list'),
  statsGrid: document.getElementById('stats-grid'),
  historyList: document.getElementById('history-list'),
  bottomNav: document.getElementById('bottom-nav'),

  toast: document.getElementById('toast'),
  toastMsg: document.getElementById('toast-msg'),
  modal: document.getElementById('modal-confirm'),
  confirmTitle: document.getElementById('confirm-title'),
  confirmBody: document.getElementById('confirm-body'),
  confirmOk: document.getElementById('confirm-ok'),
  confirmCancel: document.getElementById('confirm-cancel'),

  tplRoutine: document.getElementById('routine-card-template'),
  tplExercise: document.getElementById('exercise-card-template'),
  tplSetRow: document.getElementById('set-row-template'),
  tplTrainCard: document.getElementById('train-card-template'),
  tplTrainSetRow: document.getElementById('train-set-row-template'),
};

let toastTimer = null;
let confirmHandler = null;

export function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

export function showScreen(name) {
  els.screenRoutines.classList.toggle('hidden', name !== 'routines');
  els.screenEditor.classList.toggle('hidden', name !== 'editor');
  els.screenTrain.classList.toggle('hidden', name !== 'train');
  els.screenStats.classList.toggle('hidden', name !== 'stats');
  els.screenSettings.classList.toggle('hidden', name !== 'settings');

  els.bottomNav.classList.toggle('hidden', name === 'editor');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('nav-active', btn.dataset.screen === name);
  });
}

export function showToast(message, duration = 2200) {
  els.toastMsg.textContent = message;
  els.toast.classList.remove('hidden');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.classList.add('hidden');
  }, duration);
}

export function showConfirm({ title, body, onConfirm }) {
  confirmHandler = onConfirm;
  els.confirmTitle.textContent = title;
  els.confirmBody.textContent = body;
  els.modal.classList.remove('hidden');
}

export function closeConfirm() {
  els.modal.classList.add('hidden');
  confirmHandler = null;
}

export function bindConfirmEvents() {
  els.confirmCancel.addEventListener('click', closeConfirm);
  els.confirmOk.addEventListener('click', () => {
    if (typeof confirmHandler === 'function') confirmHandler();
    closeConfirm();
  });
}

export function renderRoutines() {
  const routines = getRoutinesArray();
  els.routineList.innerHTML = '';

  if (routines.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = `
      <p class="eyebrow">Sin rutinas</p>
      <h3 class="routine-name">Crea tu primera rutina</h3>
      <p class="routine-meta">Empieza con una push, pull, leg o full body.</p>
    `;
    els.routineList.appendChild(empty);
    return;
  }

  routines.forEach(routine => {
    const node = els.tplRoutine.content.firstElementChild.cloneNode(true);
    node.dataset.id = routine.id;
    node.querySelector('.routine-name').textContent = routine.name;
    node.querySelector('.routine-meta').textContent = `${routine.exercises.length} ejercicios`;
    els.routineList.appendChild(node);
  });

  initIcons();
}

export function renderEditor() {
  const draft = state.draftRoutine;
  els.routineName.value = draft.name;
  els.exerciseList.innerHTML = '';

  draft.exercises.forEach(exercise => {
    const card = els.tplExercise.content.firstElementChild.cloneNode(true);
    card.dataset.exerciseId = exercise.id;

    card.querySelector('.exercise-name').value = exercise.name;
    card.querySelector('.exercise-rest').value = exercise.rest ?? 90;
    card.querySelector('.exercise-cardio').checked = Boolean(exercise.cardio);

    const setsList = card.querySelector('.sets-list');

    exercise.sets.forEach((setItem, index) => {
      const row = els.tplSetRow.content.firstElementChild.cloneNode(true);
      row.dataset.setIndex = index;
      row.querySelector('.set-index').textContent = index + 1;
      row.querySelector('.set-weight').value = setItem.weight;
      row.querySelector('.set-reps').value = setItem.reps;
      setsList.appendChild(row);
    });

    els.exerciseList.appendChild(card);
  });

  initIcons();
}

export function renderTrainScreen() {
  const session = state.activeSession;
  els.trainExerciseList.innerHTML = '';

  if (!session) {
    els.trainRoutineName.textContent = 'Sin rutina';
    els.trainEmpty.classList.remove('hidden');
    els.trainExerciseList.classList.add('hidden');
    return;
  }

  els.trainRoutineName.textContent = session.routineName;
  els.trainEmpty.classList.add('hidden');
  els.trainExerciseList.classList.remove('hidden');

  session.exercises.forEach(exercise => {
    const card = els.tplTrainCard.content.firstElementChild.cloneNode(true);
    card.dataset.exerciseId = exercise.id;
    card.querySelector('.train-ex-name').textContent = exercise.name;
    card.querySelector('.train-rest').textContent = `${exercise.rest || 90}s descanso`;

    const list = card.querySelector('.train-sets-list');

    exercise.sets.forEach((setItem, index) => {
      const row = els.tplTrainSetRow.content.firstElementChild.cloneNode(true);
      row.dataset.setIndex = index;
      row.querySelector('.set-index').textContent = index + 1;
      row.querySelector('.train-set-weight').value = setItem.weight;
      row.querySelector('.train-set-reps').value = setItem.reps;
      row.querySelector('.train-set-done').checked = Boolean(setItem.done);
      list.appendChild(row);
    });

    els.trainExerciseList.appendChild(card);
  });

  initIcons();
}

export function renderStats() {
  const stats = getStats();
  els.statsGrid.innerHTML = `
    <div class="stat-card">
      <p class="stat-value">${stats.totalRoutines}</p>
      <p class="stat-label">Rutinas</p>
    </div>
    <div class="stat-card">
      <p class="stat-value">${stats.totalSessions}</p>
      <p class="stat-label">Sesiones</p>
    </div>
    <div class="stat-card">
      <p class="stat-value">${stats.totalSets}</p>
      <p class="stat-label">Series hechas</p>
    </div>
    <div class="stat-card">
      <p class="stat-value">${stats.totalMinutes}</p>
      <p class="stat-label">Minutos</p>
    </div>
  `;

  els.historyList.innerHTML = '';

  if (state.logs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-box';
    empty.textContent = 'Todavía no hay entrenamientos guardados.';
    els.historyList.appendChild(empty);
    return;
  }

  state.logs.forEach(log => {
    const item = document.createElement('article');
    item.className = 'history-item';
    item.innerHTML = `
      <h4>${log.routineName}</h4>
      <p>${formatDate(log.endedAt)} · ${formatDuration(log.durationSec)} · ${log.completedSets} series · ${Math.round(log.volume)} kg</p>
    `;
    els.historyList.appendChild(item);
  });
}

export function updateTrainTimer(seconds) {
  els.trainTimer.textContent = formatDuration(seconds);
}

function formatDuration(totalSec = 0) {
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Fecha';
  }
}
