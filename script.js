// to-do: implement search function

const previewBody = document.querySelector('.preview-body');
const notesQuantity = document.querySelector('.notes-quantity');
const pinnedQuantity = document.querySelector('.pinned-quantity');
const pin = document.querySelector('.pin');
const displayTitle = document.querySelector('.display-header .note-title');
const displayDate = document.querySelector('.display-header .note-date');
const displayContent = document.querySelector('.note-content');

function firstUnpinned() {
  let firstUnpinned;
  for (let notePrev of previewBody.children) {
    if (!notePrev.classList.contains('pinned')) {
      firstUnpinned = notePrev;
      break;
    }
  }
  return firstUnpinned;
}

function formatDate(time) {
  const date = new Date(time);
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return date.toLocaleString('en-US', options);
}

function countPins() {
  let counter = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const note = JSON.parse(localStorage.getItem(key));
    if (note.pinned) {
      counter++;
    }
  }
  return counter;
}

function disableDisplay() {
  displayTitle.value = '';
  displayDate.textContent = '';
  displayContent.value = '';
  document.querySelector('#display').style.pointerEvents = 'none';
  document.getElementById('pinBtn').style.fill = '#ccc';
}

//create note
const addNote = document.querySelector('.add-note');
// addNote.addEventListener('click', handleAddNote);
function handleAddNote(currentDate) {
  document.querySelector('#display').style.pointerEvents = 'auto';
  const dateCreated = currentDate ? currentDate : Date.now();
  const note = {
    title: formatDate(dateCreated),
    dateCreated: dateCreated,
    lastUpdated: dateCreated,
    content: '',
    pinned: false,
  };
  localStorage.setItem(dateCreated, JSON.stringify(note));
  notesQuantity.textContent = localStorage.length;
  pinnedQuantity.textContent = countPins();
  renderNotes();
  selectAndDisplayNote(document.getElementById(note.dateCreated));
}

function renderNote(note) {
  const notePreview = document.createElement('div');
  notePreview.classList.add('note-preview');
  notePreview.id = note.dateCreated;
  const tdPreview = document.createElement('div');
  tdPreview.classList.add('title-date-preview');
  const noteTitle = document.createElement('div');
  noteTitle.classList.add('note-title');
  const noteDate = document.createElement('div');
  noteDate.classList.add('note-date');
  const trash = document.createElement('div');
  trash.classList.add('trash');
  trash.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`;
  noteTitle.textContent = note.title;
  noteDate.textContent = formatDate(note.lastUpdated);
  tdPreview.append(noteTitle, noteDate);
  notePreview.append(tdPreview, trash);
  previewBody.prepend(notePreview);

  if (note.pinned) {
    notePreview.classList.add('pinned');
  }

  //handle select note
  notePreview
    .querySelector('.title-date-preview')
    .addEventListener('click', () => {
      selectAndDisplayNote(notePreview);
    });

  //handle delete note
  notePreview.querySelector('.trash').addEventListener('click', () => {
    if (previewBody.children.length === 1) {
      disableDisplay();
    } else {
      //if deleting selected note, select & display sibling note
      if (notePreview.classList.contains('selected')) {
        let sibling;
        if (notePreview.nextElementSibling) {
          sibling = notePreview.nextElementSibling;
        } else {
          sibling = notePreview.previousElementSibling;
        }
        selectAndDisplayNote(sibling);
      }
    }
    localStorage.removeItem(note.dateCreated);
    notePreview.parentNode.removeChild(notePreview);
    notesQuantity.textContent = localStorage.length;
    pinnedQuantity.textContent = countPins();
  });
}

function selectAndDisplayNote(notePreview) {
  document.querySelectorAll('.note-preview').forEach((row) => {
    if (row.classList.contains('selected')) {
      row.classList.remove('selected');
    }
  });
  notePreview.classList.add('selected');
  const note = JSON.parse(localStorage.getItem(notePreview.id));
  displayTitle.value = note.title;
  displayDate.textContent = formatDate(note.lastUpdated);
  displayContent.value = note.content;

  if (note.pinned) {
    document.getElementById('pinBtn').style.fill = 'black';
  } else {
    document.getElementById('pinBtn').style.fill = '#ccc';
  }
  if (
    formatDateDay(note.dateCreated) !== formatDateDay(Date.now()) &&
    !note.pinned
  ) {
    document.querySelector('#display').style.pointerEvents = 'none';
    document.querySelector('.pin').style.pointerEvents = 'auto';
  } else {
    document.querySelector('#display').style.pointerEvents = 'auto';
  }
}

function renderNotes() {
  const notes = [];
  const pins = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const note = JSON.parse(localStorage.getItem(key));
    if (note.pinned) {
      pins.push(note);
    } else {
      notes.push(note);
    }
  }
  notes.sort(
    (noteA, noteB) => parseInt(noteA.lastUpdated) - parseInt(noteB.lastUpdated)
  );
  pins.sort(
    (noteA, noteB) => parseInt(noteA.lastUpdated) - parseInt(noteB.lastUpdated)
  );
  const notesArray = [...notes, ...pins];

  previewBody.innerHTML = '';
  for (let note of notesArray) {
    renderNote(note);
  }
}

displayContent.addEventListener('input', updateContent);
function updateContent() {
  const lastUpdated = Date.now();
  const notePreview = document.querySelector('.note-preview.selected');

  const currentNote = localStorage.getItem(notePreview.id);
  const updatedNote = JSON.parse(currentNote);
  updatedNote.content = displayContent.value;
  updatedNote.lastUpdated = lastUpdated;
  localStorage.setItem(notePreview.id, JSON.stringify(updatedNote));

  if (updatedNote.pinned) {
    notePreview.parentNode.removeChild(notePreview);
    previewBody.prepend(notePreview);
  } else {
    renderNotes();
    let firstUnpinned;
    for (let notePrev of previewBody.children) {
      if (!notePrev.classList.contains('pinned')) {
        firstUnpinned = notePrev;
        break;
      }
    }
    selectAndDisplayNote(firstUnpinned);
  }
}

pin.addEventListener('click', updatePinned);
function updatePinned() {
  const notePreview = document.querySelector('.note-preview.selected');
  const currentNote = localStorage.getItem(notePreview.id);
  const updatedNote = JSON.parse(currentNote);

  if (!notePreview.classList.contains('pinned')) {
    updatedNote.pinned = true;
    localStorage.setItem(notePreview.id, JSON.stringify(updatedNote));
    notePreview.classList.add('pinned');
    document.getElementById('pinBtn').style.fill = 'black';
    //insert note back into pinned notes order based on lastUpdated
    notePreview.parentNode.removeChild(notePreview);
    previewBody.prepend(notePreview);

    //allow editing
    selectAndDisplayNote(notePreview);

    let siblings = countPins() - 1;
    if (siblings !== 0) {
      for (let i = 0; i < siblings; i++) {
        let nextSib = notePreview.nextElementSibling;
        let nextSibNote = JSON.parse(localStorage.getItem(nextSib.id));
        if (updatedNote.lastUpdated >= nextSibNote.lastUpdated) {
          break;
        }
        nextSib.parentNode.removeChild(nextSib);
        previewBody.insertBefore(nextSib, notePreview);
      }
    }
  } else {
    updatedNote.pinned = false;
    localStorage.setItem(notePreview.id, JSON.stringify(updatedNote));
    notePreview.classList.remove('pinned');
    document.getElementById('pinBtn').style.fill = '#ccc';
    //if pinned window is being displayed, remove pin from display and select & display sibling
    if (
      document
        .querySelector('.pinned-row')
        .classList.contains('selected-category')
    ) {
      if (previewBody.children.length === 1) {
        notePreview.parentNode.removeChild(notePreview);
        disableDisplay();
      } else {
        let sibling;
        if (notePreview.nextElementSibling) {
          sibling = notePreview.nextElementSibling;
        } else {
          sibling = notePreview.previousElementSibling;
        }
        selectAndDisplayNote(sibling);
        notePreview.parentNode.removeChild(notePreview);
      }
    } else {
      //insert note back into unpinned notes order based on lastUpdated
      notePreview.parentNode.removeChild(notePreview);
      previewBody.insertBefore(notePreview, previewBody.children[countPins()]);

      //allow/disallow editing
      selectAndDisplayNote(notePreview);

      let siblings = previewBody.children.length - countPins() - 1;
      if (siblings !== 0) {
        for (let i = 0; i < siblings; i++) {
          let nextSib = notePreview.nextElementSibling;
          let nextSibNote = JSON.parse(localStorage.getItem(nextSib.id));
          if (updatedNote.lastUpdated >= nextSibNote.lastUpdated) {
            break;
          }
          nextSib.parentNode.removeChild(nextSib);
          previewBody.insertBefore(nextSib, notePreview);
        }
      }
    }
  }
  pinnedQuantity.textContent = countPins();
}

displayTitle.addEventListener('input', updateTitle);
function updateTitle() {
  const lastUpdated = Date.now();
  const notePreview = document.querySelector('.note-preview.selected');

  const currentNote = localStorage.getItem(notePreview.id);
  const updatedNote = JSON.parse(currentNote);
  updatedNote.title = displayTitle.value;
  updatedNote.lastUpdated = lastUpdated;
  localStorage.setItem(notePreview.id, JSON.stringify(updatedNote));

  notePreview.querySelector('.note-title').textContent =
    updatedNote.title.length > 30
      ? `${updatedNote.title.substring(0, 27)}...`
      : updatedNote.title;
  notePreview.querySelector('.note-date').textContent = formatDate(
    updatedNote.lastUpdated
  );
  displayDate.textContent = formatDate(updatedNote.lastUpdated);

  if (updatedNote.pinned) {
    notePreview.parentNode.removeChild(notePreview);
    previewBody.prepend(notePreview);
  } else {
    renderNotes();
    let firstUnpinned;
    for (let notePrev of previewBody.children) {
      if (!notePrev.classList.contains('pinned')) {
        firstUnpinned = notePrev;
        break;
      }
    }
    selectAndDisplayNote(firstUnpinned);
  }
}

const notesTag = document.querySelector('.notes-row');
const pinnedTag = document.querySelector('.pinned-row');

notesTag.addEventListener('click', (e) => {
  addNote.classList.remove('remove-add-btn');
  handleTagClick(e);
  document.querySelector(
    '.current-svg'
  ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-200h560v-367L567-760H200v560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h400l240 240v400q0 33-23.5 56.5T760-120H200Zm80-160h400v-80H280v80Zm0-160h400v-80H280v80Zm0-160h280v-80H280v80Zm-80 400v-560 560Z"/></svg>`;
  document.querySelector('.current-category').textContent = 'Notes';
  if (localStorage.length !== 0) {
    document.querySelector('#display').style.pointerEvents = 'auto';
    renderNotes();
    if (localStorage.length === countPins()) {
      selectAndDisplayNote(previewBody.firstChild);
    } else {
      selectAndDisplayNote(firstUnpinned());
    }
  } else {
    disableDisplay();
  }
});
pinnedTag.addEventListener('click', (e) => {
  addNote.classList.add('remove-add-btn');
  handleTagClick(e);
  document.querySelector(
    '.current-svg'
  ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"/></svg>`;
  document.querySelector('.current-category').textContent = 'Pinned';
  renderPinnedNotes();
  if (countPins() !== 0) {
    document.querySelector('#display').style.pointerEvents = 'auto';
    selectAndDisplayNote(document.querySelector('.preview-body').firstChild);
  } else {
    disableDisplay();
  }
});

function handleTagClick(e) {
  document.querySelectorAll('.sidebar-row').forEach((row) => {
    if (row.classList.contains('selected-category')) {
      row.classList.remove('selected-category');
    }
  });
  e.target.closest('.sidebar-row').classList.add('selected-category');
}

function renderPinnedNotes() {
  const pins = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const note = JSON.parse(localStorage.getItem(key));
    if (note.pinned) {
      pins.push(note);
    }
  }
  pins.sort(
    (noteA, noteB) => parseInt(noteA.lastUpdated) - parseInt(noteB.lastUpdated)
  );
  previewBody.innerHTML = '';
  for (let pin of pins) {
    renderNote(pin);
  }
}

function onLoad() {
  if (localStorage.length === 0) {
    disableDisplay();
  } else {
    notesTag.click();
    notesQuantity.textContent = localStorage.length;
    pinnedQuantity.textContent = countPins();
    selectAndDisplayNote(previewBody.firstChild);
  }
}

function formatDateDay(time) {
  const date = new Date(time);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleString('en-US', options);
}

let numOfNotesAllowed = 1;
function noteLimitReached(currentDate) {
  let counter = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const note = JSON.parse(localStorage.getItem(key));
    if (formatDateDay(note.dateCreated) === formatDateDay(currentDate)) {
      counter++;
    }
    if (counter === numOfNotesAllowed) {
      return true;
    }
  }
  return false;
}

//limit the amount of notes that can be made per day
addNote.addEventListener('click', () => {
  const currentDate = Date.now();
  if (noteLimitReached(currentDate)) {
    alert(`daily note limit (${numOfNotesAllowed}) has been reached`);
  } else {
    handleAddNote(currentDate);
  }
});

onLoad();
