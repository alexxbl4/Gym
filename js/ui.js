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

  summaryModal: document.getElementById('summary-modal'),
  summaryRoutine: document.getElementById('summary-routine'),
  summaryTime: document.getElementById('summary-time'),
  summaryVolume: document.getElementById('summary-volume'),
  summarySets: document.getElementById('summary-sets'),
  summaryPrs: document.getElementById('summary-prs'),
  summaryPrList: document.getElementById('summary-pr-list'),

  calMonth: document.getElementById('cal-month'),
  calDays: document.getElementById('calendar-days'),
  calDetail: document.getElementById('calendar-day-detail'),
  calDetailDate: document.getElementById('cal-detail-date'),
  calDetailContent: document.getElementById('cal-detail-content'),

  tplRoutine: document.getElementById('routine-card-template'),
  tplExercise: document.getElementById('exercise-card-template'),
  tplSetRow: document.getElementById('set-row-template'),
  tplTrainCard: document.getElementById('train-card-template'),
  tplTrainSetRow: document.getElementById('train-set-row-template'),
  tplLibraryItem: document.getElementById('library-item-template'),
};

let toastTimer = null;
let confirmHandler = null;
export let currentCalDate = new Date();

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
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), duration);
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

export function showSummaryModal(routineName, duration, volume, sets, prs) {
  els.summaryRoutine.textContent = routineName;
  els.summaryTime.textContent = formatDuration(duration);
  els.summaryVolume.textContent = Math.round(volume);
  els.summarySets.textContent = sets;
  els.summaryPrs.textContent = prs.length;
  
  els.summaryPrList.innerHTML = '';
  if (prs.length > 0) {
    prs.forEach(pr => {
      const div = document.createElement('div');
      div.className = 'pr-item';
      div.innerHTML = `<span>${pr.name}</span><span>${pr.value} ${pr.type === 'Peso' || pr.type === 'Volumen' ? 'kg' : ''}</span>`;
      els.summaryPrList.appendChild(div);
    });
  }

  els.summaryModal.classList.remove('hidden');
  initIcons();
}

export function closeSummaryModal() {
  els.summaryModal.classList.add('hidden');
}

export function openLibraryModal() { els.libraryModal.classList.remove('hidden'); }
export function closeLibraryModal() { els.libraryModal.classList.add('hidden'); }
export function closeExerciseDetailModal() { els.detailModal.classList.add('hidden'); }

export function openExerciseDetailModal(name) {
  const detail = getExerciseDetail(name);
  els.detailTitle.textContent = name;
  els.detailPrs.innerHTML = `
    <div class="stat-card"><p class="stat-value">${Math.round(detail.prs.bestWeight)}</p><p class="stat-label">Mejor peso</p></div>
    <div class="stat-card"><p class="stat-value">${Math.round(detail.prs.bestVolume)}</p><p class="stat-label">Mejor volumen</p></div>
    <div class="stat-card"><p class="stat-value">${Math.round(detail.prs.bestEstimated1RM)}</p><p class="stat-label">1RM estimado</p></div>
    <div class="stat-card"><p class="stat-value">${detail.prs.sessions}</p><p class="stat-label">Sesiones</p></div>
  `;
  
  // Omitimos chart aquí por simplificar en vanilla (igual que versión anterior)
  els.detailHistory.innerHTML = '';
  if (detail.history.length === 0) {
    els.detailHistory.innerHTML = '<div class="empty-box">Aún no hay historial para este ejercicio.</div>';
  } else {
    detail.history.forEach(item => {
      const article = document.createElement('article');
      article.className = 'history-item';
      article.innerHTML = `
        <h4>${formatDate(item.date)} · ${item.routineName}</h4>
        <p>${item.completedSets} series · ${Math.round(item.volume)} kg volumen · Top ${Math.round(item.bestWeight)} kg</p>
        <p>${item.sets.map(s => `${s.weight}×${s.reps}`).join(' · ')}</p>
      `;
      els.detailHistory.appendChild(article);
    });
  }
  els.detailModal.classList.remove('hidden');
  initIcons();
}

// CALENDARIO
export function renderCalendar() {
  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();
  
  els.calMonth.textContent = new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1).getDay(); // 0=Dom, 1=Lun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Ajuste para que empiece en Lunes
  let startDay = firstDay === 0 ? 6 : firstDay - 1;
  
  els.calDays.innerHTML = '';
  
  // Extraer logs de este mes
  const logsByDate = {};
  state.logs.forEach(log => {
    const d = new Date(log.endedAt);
    if(d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if(!logsByDate[day]) logsByDate[day] = [];
      logsByDate[day].push(log);
    }
  });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Días vacíos previos
  for(let i = 0; i < startDay; i++) {
    const div = document.createElement('div');
    div.className = 'cal-day empty';
    els.calDays.appendChild(div);
  }

  // Días reales
  for(let i = 1; i <= daysInMonth; i++) {
    const div = document.createElement('div');
    div.className = 'cal-day';
    div.textContent = i;
    div.dataset.day = i;
    
    if (isCurrentMonth && i === today.getDate()) div.classList.add('today');
    if (logsByDate[i]) div.classList.add('trained');

    div.addEventListener('click', () => {
      document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
      div.classList.add('selected');
      showCalendarDetail(i, logsByDate[i]);
    });

    els.calDays.appendChild(div);
  }
  
  els.calDetail.classList.add('hidden');
}

function showCalendarDetail(day, logs) {
  els.calDetail.classList.remove('hidden');
  els.calDetailDate.textContent = `${day} de ${els.calMonth.textContent}`;
  
  if(!logs || logs.length === 0) {
    els.calDetailContent.innerHTML = '<p class="setting-text">No se registró entrenamiento este día.</p>';
    return;
  }

  els.calDetailContent.innerHTML = logs.map(log => `
    <div class="pr-item" style="flex-direction:column; align-items:flex-start; gap:4px;">
      <span style="color:var(--text);">${log.routineName}</span>
      <span style="color:var(--muted); font-weight:700;">${formatDuration(log.durationSec)} · ${log.completedSets} series · ${Math.round(log.volume)} kg</span>
    </div>
  `).join('');
}


// OTRAS FUNCIONES UI QUE YA TENÍAS
export function renderLibrary() { /* ... igual que antes ... */ }
export function renderRoutines() {
  const routines = getRoutinesArray();
  els.routineList.innerHTML = '';
  if (routines.length === 0) {
    els.routineList.innerHTML = `<div class="card"><p class="eyebrow">Sin rutinas</p><h3 class="routine-name">Crea tu primera rutina</h3></div>`;
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
  draft.exercises.forEach((exercise, index) => {
    const card = els.tplExercise.content.firstElementChild.cloneNode(true);
    card.dataset.exerciseId = exercise.id;
    card.querySelector('.exercise-name').value = exercise.name;
    card.querySelector('.exercise-rest').value = exercise.rest ?? 90;
    card.querySelector('.exercise-cardio').checked = Boolean(exercise.cardio);
    
    if (index === 0) card.querySelector('.action-move-up').disabled = true;
    if (index === draft.exercises.length - 1) card.querySelector('.action-move-down').disabled = true;

    const setsList = card.querySelector('.sets-list');
    exercise.sets.forEach((setItem, setIndex) => {
      const row = els.tplSetRow.content.firstElementChild.cloneNode(true);
      row.dataset.setIndex = setIndex;
      row.querySelector('.set-index').textContent = setIndex + 1;
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
  renderCalendar(); // Llama al calendario

  const stats = getStats();
  els.statsGrid.innerHTML = `
    <div class="stat-card"><p class="stat-value">${stats.totalSessions}</p><p class="stat-label">Sesiones</p></div>
    <div class="stat-card"><p class="stat-value">${stats.totalSets}</p><p class="stat-label">Series</p></div>
    <div class="stat-card"><p class="stat-value">${stats.totalMinutes}</p><p class="stat-label">Minutos</p></div>
    <div class="stat-card"><p class="stat-value">${Math.round(stats.totalVolume/1000)}k</p><p class="stat-label">KG Movidos</p></div>
  `;

  const exerciseProgress = getExerciseProgressList();
  els.exerciseProgressList.innerHTML = '';
  if (exerciseProgress.length === 0) {
    els.exerciseProgressList.innerHTML = '<div class="empty-box">Completa entrenamientos para ver progreso.</div>';
  } else {
    exerciseProgress.slice(0, 5).forEach(item => { // Solo mostramos top 5
      const article = document.createElement('article');
      article.className = 'history-item';
      article.dataset.exerciseName = item.name;
      article.innerHTML = `<h4>${item.name}</h4><p>${item.sessions} sesiones · Top ${Math.round(item.bestWeight)} kg</p>`;
      els.exerciseProgressList.appendChild(article);
    });
  }

  els.historyList.innerHTML = '';
  if (state.logs.length === 0) {
    els.historyList.innerHTML = '<div class="empty-box">Todavía no hay historial.</div>';
  } else {
    state.logs.slice(0,10).forEach(log => {
      const item = document.createElement('article');
      item.className = 'history-item';
      item.innerHTML = `<h4>${log.routineName}</h4><p>${formatDate(log.endedAt)} · ${formatDuration(log.durationSec)} · ${Math.round(log.volume)} kg</p>`;
      els.historyList.appendChild(item);
    });
  }
}

export function updateTrainTimer(seconds) { els.trainTimer.textContent = formatDuration(seconds); }
export function renderRestTimer() {
  const timer = state.restTimer;
  if (!timer.active) { els.restBar.classList.add('hidden'); return; }
  els.restBar.classList.remove('hidden');
  els.restTime.textContent = formatDuration(timer.remaining);
  els.restProgress.style.width = `${(timer.remaining / timer.total) * 100}%`;
}

export function formatDuration(totalSec = 0) {
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}
function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }); } 
  catch { return 'Fecha'; }
}
