import { state } from './state.js';

const els = {
  screenMain: document.getElementById('screen-main'),
  screenEditor: document.getElementById('screen-editor'),
  routineList: document.getElementById('routine-list'),
  routineName: document.getElementById('routine-name'),
  exerciseList: document.getElementById('exercise-list'),
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
};

let toastTimer = null;
let confirmHandler = null;

export function initIcons() {
  if (window.lucide) window.lucide.createIcons();
}

export function showScreen(name) {
  els.screenMain.classList.toggle('hidden', name !== 'main');
  els.screenEditor.classList.toggle('hidden', name !== 'editor');
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
  const routines = Object.values(state.routines);
  els.routineList.innerHTML = '';

  if (routines.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.innerHTML = `
      <p class="eyebrow">Sin rutinas</p>
      <h3 class="routine-name">Crea tu primera rutina</h3>
      <p class="routine-meta">Empieza con pecho, pierna o push pull legs.</p>
    `;
    els.routineList.appendChild(empty);
    return;
  }

  routines
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach(routine => {
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
