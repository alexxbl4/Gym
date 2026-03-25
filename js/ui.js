import { LIBRARY_CATEGORIES } from './constants.js';
import {
  getExerciseDetail,
  getExerciseProgressList,
  getFilteredLibrary,
  getRoutinesArray,
  getStats,
  state,
} from './state.js';

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
  exerciseProgressList: document.getElementById('exercise-progress-list'),
  bottomNav: document.getElementById('bottom-nav'),

  libraryModal: document.getElementById('library-modal'),
  librarySearch: document.getElementById('library-search'),
  libraryCats: document.getElementById('library-cats'),
  libraryList: document.getElementById('library-list'),
  libraryCustomBox: document.getElementById('library-custom-box'),
  libraryCustomText: document.getElementById('library-custom-text'),

  detailModal: document.getElementById('exercise-detail-modal'),
  detailTitle: document.getElementById('exercise-detail-title'),
  detailPrs: document.getElementById('exercise-detail-prs'),
  detailHistory: document.getElementById('exercise-detail-history'),

  restBar: document.getElementById('rest-bar'),
  restTime: document.getElementById('rest-time'),
  restProgress: document.getElementById('rest-progress'),

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
  tplLibraryItem: document.getElementById('library-item-template'),
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

export function openLibraryModal() {
  els.libraryModal.classList.remove('hidden');
}

export function closeLibraryModal() {
  els.libraryModal.classList.add('hidden');
}

export function openExerciseDetailModal(name) {
  const detail = getExerciseDetail(name);
  els.detailTitle.textContent = name;
  els.detailPrs.innerHTML = `
    <div class="stat-card">
      <p class="stat-value">${Math.round(detail.prs.bestWeight)}</p>
      <p class="stat-label">Mejor peso</p>
    </div>
    <div class="stat-card">
      <p class="stat-value">${Math.round(detail.prs.bestVolume)}</p>
      <p class="stat-label">Mejor volumen</p>
    </div>
    <div class="stat-card">
      <p class="stat-value">${Math.round(detail.prs.bestEstimated1RM)}</p>
      <p class="stat-label">1RM estimado</p>
    </div>
    <div class="stat-card">
      <p class="stat-value">${detail.prs.sessions}</p>
      <p class="stat-label">Sesiones</p>
    </div>
  `;

  const chartHtml = renderMiniChart(detail.chartPoints);
  els.detailHistory.innerHTML = `
    <div class="panel" style="padding:16px;">
      <p class="eyebrow">Gráfica</p>
      ${chartHtml}
    </div>
  `;

  if (detail.history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-box';
    empty.textContent = 'Aún no hay historial para este ejercicio.';
    els.detailHistory.appendChild(empty);
  } else {
    detail.history.forEach(item => {
      const article = document.createElement('article');
      article.className = 'history-item';
      article.innerHTML = `
        <h4>${formatDate(item.date)} · ${item.routineName}</h4>
        <p>${item.completedSets} series · ${Math.round(item.volume)} kg volumen · ${Math.round(item.bestWeight)} kg top set · 1RM ${Math.round(item.bestEstimated1RM)}</p>
        <p>${item.sets.map(setItem => `${setItem.weight}×${setItem.reps}`).join(' · ')}</p>
      `;
      els.detailHistory.appendChild(article);
    });
  }

  els.detailModal.classList.remove('hidden');
  initIcons();
}

export function closeExerciseDetailModal() {
  els.detailModal.classList.add('hidden');
}

function renderMiniChart(points) {
  if (!points.length) {
    return `<div class="empty-box">Aún no hay suficientes datos.</div>`;
  }

  const max = Math.max(...points.map(p => p.bestWeight), 1);

  const bars = points
    .map(
      p => `
      <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:8px;">
        <div title="${p.bestWeight} kg" style="width:100%; max-width:26px; height:${Math.max((p.bestWeight / max) * 120, 10)}px; background:linear-gradient(180deg,#60a5fa,#2563eb); border-radius:10px 10px 4px 4px;"></div>
        <span style="font-size:10px; color:#71717a; font-weight:800;">${p.label}</span>
      </div>
    `
    )
    .join('');

  return `
    <div style="display:flex; align-items:flex-end; gap:8px; min-height:150px; padding-top:8px;">
      ${bars}
    </div>
    <p style="margin:10px 0 0; color:#71717a; font-size:11px; font-weight:700;">Top set por sesión (kg)</p>
  `;
}

export function renderLibrary() {
  els.librarySearch.value = state.libraryQuery;
  els.libraryCats.innerHTML = '';

  LIBRARY_CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `chip ${state.libraryCategory === cat ? 'active' : ''}`;
    btn.dataset.cat = cat;
    btn.textContent = cat;
    els.libraryCats.appendChild(btn);
  });

  const list = getFilteredLibrary();
  els.libraryList.innerHTML = '';

  list.forEach(item => {
    const node = els.tplLibraryItem.content.firstElementChild.cloneNode(true);
    node.dataset.name = item.name;
    node.querySelector('.library-cat').textContent = item.cat;
    node.querySelector('.library-name').textContent = item.name;
    els.libraryList.appendChild(node);
  });

  const query = state.libraryQuery.trim();
  const exactMatch = list.some(item => item.name.toLowerCase() === query.toLowerCase());
  const canSuggest = query.length > 2 && !exactMatch;

  els.libraryCustomBox.classList.toggle('hidden', !canSuggest);
  els.libraryCustomText.textContent = canSuggest
    ? `Guardar "${query}" en Mis ejercicios`
    : '';

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-box';
    empty.textContent = 'No hay ejercicios para ese filtro.';
    els.libraryList.appendChild(empty);
  }

  initIcons();
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

      if (setItem.done) row.classList.add('done');

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

  const exerciseProgress = getExerciseProgressList();
  els.exerciseProgressList.innerHTML = '';

  if (exerciseProgress.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-box';
    empty.textContent = 'Completa entrenamientos para ver progreso por ejercicio.';
    els.exerciseProgressList.appendChild(empty);
  } else {
    exerciseProgress.forEach(item => {
      const article = document.createElement('article');
      article.className = 'history-item';
      article.dataset.exerciseName = item.name;
      article.innerHTML = `
        <h4>${item.name}</h4>
        <p>${item.sessions} sesiones · Top ${Math.round(item.bestWeight)} kg · Volumen ${Math.round(item.bestVolume)} kg · 1RM ${Math.round(item.bestEstimated1RM)}</p>
      `;
      els.exerciseProgressList.appendChild(article);
    });
  }

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

export function renderRestTimer() {
  const timer = state.restTimer;

  if (!timer.active) {
    els.restBar.classList.add('hidden');
    return;
  }

  els.restBar.classList.remove('hidden');
  els.restTime.textContent = formatDuration(timer.remaining);
  const width = timer.total > 0 ? (timer.remaining / timer.total) * 100 : 0;
  els.restProgress.style.width = `${width}%`;
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
