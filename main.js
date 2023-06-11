// Open a connection to the IndexedDB database
const openRequest = indexedDB.open('NoteDatabase', 1);

openRequest.onupgradeneeded = function(event) {
  const db = event.target.result;

  // Create an object store to store notes
  if (!db.objectStoreNames.contains('notes')) {
    db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
  }
};

openRequest.onerror = function() {
  console.error('Error opening database');
};

openRequest.onsuccess = function(event) {
  const db = event.target.result;
  const noteForm = document.getElementById('note-form');
  const noteInput = document.getElementById('note-input');
  const noteList = document.getElementById('note-list');

  // Function to display notes on the page
  function displayNotes() {
    noteList.innerHTML = '';

    const objectStore = db.transaction('notes', 'readonly').objectStore('notes');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
      const notes = event.target.result;

      for (let i = 0; i < notes.length; i++) {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
          <p>${notes[i].text}</p>
          <button class="edit-button" data-note-id="${notes[i].id}">Edit</button>
          <button class="delete-button" data-note-id="${notes[i].id}">Delete</button>
        `;
        noteList.appendChild(noteItem);
      }
    };
  }

  // Function to add a new note
  function addNote() {
    const noteText = noteInput.value.trim();

    if (noteText !== '') {
      const objectStore = db.transaction('notes', 'readwrite').objectStore('notes');
      const request = objectStore.add({ text: noteText });

      request.onsuccess = function() {
        noteInput.value = '';
        displayNotes();
      };
    }
  }

  // Function to edit a note
  function editNote(id) {
    const noteText = prompt('Enter your updated note');

    if (noteText !== null) {
      const objectStore = db.transaction('notes', 'readwrite').objectStore('notes');
      const request = objectStore.get(Number(id));

      request.onsuccess = function(event) {
        const note = event.target.result;
        note.text = noteText;

        const updateRequest = objectStore.put(note);

        updateRequest.onsuccess = function() {
          displayNotes();
        };
      };
    }
  }

  // Function to delete a note
  function deleteNote(id) {
    const objectStore = db.transaction('notes', 'readwrite').objectStore('notes');
    const request = objectStore.delete(Number(id));

    request.onsuccess = function() {
      displayNotes();
    };
  }

  // Event listener for form submission
  noteForm.addEventListener('submit', function(event) {
    event.preventDefault();

    addNote();
  });

  // Event delegation for handling click events on the note list
  noteList.addEventListener('click', function(event) {
    const target = event.target;

    // Check if the clicked element is an edit button
    if (target.classList.contains('edit-button')) {
      const noteId = target.dataset.noteId;
      editNote(noteId);
    }

    // Check if the clicked element is a delete button
    if (target.classList.contains('delete-button')) {
      const noteId = target.dataset.noteId;
      deleteNote(noteId);
    }
  });

  // Display existing notes on page load
  displayNotes();
};
