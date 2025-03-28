// ------------------ Selectors ------------------
const form = document.querySelector('form');
const toDoInput = document.querySelector('.todo-input');
const priorityInput = document.querySelector('.priority-input');
const dueDateInput = document.querySelector('.due-date-input');
const timeInput = document.querySelector('.time-input'); // New time input
const toDoList = document.querySelector('.todo-list');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');
const sortAscBtn = document.getElementById('sortAsc');
const sortDescBtn = document.getElementById('sortDesc');

// Make the task list scrollable if there are many tasks
toDoList.style.maxHeight = '70vh';
toDoList.style.overflowY = 'auto';

// ------------------ Event Listeners ------------------
form.addEventListener('submit', addToDo);
toDoList.addEventListener('click', taskAction);
document.addEventListener("DOMContentLoaded", () => {
  renderTasks(getLocalTodos());
});
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));
sortAscBtn.addEventListener('click', () => sortTasks('asc'));
sortDescBtn.addEventListener('click', () => sortTasks('desc'));

// Check if a theme has been set previously (default to standard)
let savedTheme = localStorage.getItem('savedTheme') || 'standard';
changeTheme(savedTheme);

// Mapping for priority order (lower number means higher priority)
const priorityMap = { high: 1, medium: 2, low: 3 };

// ------------------ Functions ------------------

// Add a new to-do item
function addToDo(event) {
  event.preventDefault();
  if (
    toDoInput.value.trim() === '' ||
    dueDateInput.value === '' ||
    timeInput.value === ''
  ) {
    alert("Please enter a task, due date, and time!");
    return;
  }
  
  // Validate due date and time aren't in the past
  const dueDateTime = new Date(`${dueDateInput.value}T${timeInput.value}`);
  const now = new Date();
  
  if (dueDateTime <= now) {
    alert("Due date and time must be in the future. Please select a future date and time.");
    return;
  }
  
  const taskId = Date.now(); // Unique ID for the task
  const task = {
    id: taskId,
    text: toDoInput.value,
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
    time: timeInput.value
  };
  
  // Save to local storage
  savelocal(task);
  
  // Render task
  renderTask(task);
  
  // Clear input fields
  toDoInput.value = '';
  dueDateInput.value = '';
  timeInput.value = '';
}

// Render a single task in the DOM
function renderTask(task) {
  // Create container div and set data attribute for the task id
  const toDoDiv = document.createElement("div");
  toDoDiv.classList.add('todo', `${savedTheme}-todo`);
  toDoDiv.setAttribute('data-id', task.id);
  
  // Create li element for the task text
  const newToDo = document.createElement('li');
  newToDo.innerText = task.text;
  newToDo.classList.add('todo-item', `${task.priority}-priority`);
  toDoDiv.appendChild(newToDo);
  
  // Append due date and time display if available
  if (task.dueDate || task.time) {
    const dueSpan = document.createElement('span');
    dueSpan.classList.add('due-date');
    let displayText = 'Due: ';
    if (task.dueDate) {
      displayText += task.dueDate;
    }
    if (task.time) {
      displayText += ' at ' + task.time;
    }
    dueSpan.innerText = displayText;
    toDoDiv.appendChild(dueSpan);
  }
  
  // Create and append the check button
  const checkBtn = document.createElement('button');
  checkBtn.innerHTML = '<i class="fas fa-check"></i>';
  checkBtn.classList.add('check-btn', `${savedTheme}-button`);
  toDoDiv.appendChild(checkBtn);
  
  // Create and append the edit button
  const editBtn = document.createElement('button');
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.classList.add('edit-btn', `${savedTheme}-button`);
  toDoDiv.appendChild(editBtn);
  
  // Create and append the delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.classList.add('delete-btn', `${savedTheme}-button`);
  toDoDiv.appendChild(deleteBtn);
  
  // Append to the list
  toDoList.appendChild(toDoDiv);
}

// Handler for check, edit, and delete buttons using event delegation
function taskAction(event) {
  const item = event.target;
  // Get the parent task container
  const taskDiv = item.closest('.todo');
  if (!taskDiv) return;
  const taskId = Number(taskDiv.getAttribute('data-id'));
  
  // Delete functionality
  if (item.classList.contains('delete-btn') || item.parentElement.classList.contains('delete-btn')) {
    if (confirm("Are you sure you want to delete this task?")) {
      taskDiv.classList.add("fall");
      // Remove from local storage so that a refresh won't show this task again
      removeLocalTask(taskId);
      taskDiv.addEventListener('transitionend', function(){
        taskDiv.remove();
      });
    }
  }
  
  // Check functionality: toggle completed class and congratulate the user
  if (item.classList.contains('check-btn') || item.parentElement.classList.contains('check-btn')) {
    taskDiv.classList.toggle("completed");
    
    // If task is marked as completed, show congratulatory message
    if (taskDiv.classList.contains("completed")) {
      alert("Congrats, you never gave up!");
    }
  }
  
  // Edit functionality: immediately show warning and prompt for new values
  if (item.classList.contains('edit-btn') || item.parentElement.classList.contains('edit-btn')) {
    if (confirm("Warning: Editing this task will permanently overwrite its current values. Do you wish to continue?")) {
      editTask(taskDiv, taskId);
    }
  }
}

// Check if a date and time are in the future (strictly greater than current time)
function isDateTimeFuture(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  
  return dateTime > now;
}

// Format current date as YYYY-MM-DD
function getCurrentDateFormatted() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Format current time as HH:MM with a minute added (to ensure it's future)
function getCurrentTimePlusMinuteFormatted() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1); // Add 1 minute to current time
  return now.toTimeString().substring(0, 5); // Get HH:MM format
}

// Edit a task: update DOM and local storage with new values
function editTask(taskDiv, taskId) {
  // Get current values
  const currentText = taskDiv.querySelector('.todo-item').innerText;
  const currentDueSpan = taskDiv.querySelector('.due-date');
  let currentDueDate = "";
  let currentTime = "";
  
  if (currentDueSpan) {
    const dueInfo = currentDueSpan.innerText.replace('Due: ', '');
    if (dueInfo.includes(" at ")) {
      const parts = dueInfo.split(" at ");
      currentDueDate = parts[0];
      currentTime = parts[1];
    } else {
      currentDueDate = dueInfo;
    }
  }
  
  // Prompt user for new task text
  const newText = prompt("Edit the task:", currentText);
  if (newText === null || newText.trim() === "") return; // Cancelled or empty
  
  // Variables for date/time validation
  let validDateTime = false;
  let newDueDate = "";
  let newTime = "";
  
  // Get current date and time for suggestions
  const currentDate = getCurrentDateFormatted();
  const currentTimePlus = getCurrentTimePlusMinuteFormatted();
  
  // Keep prompting until user enters a valid future date and time
  while (!validDateTime) {
    // Prompt for date
    newDueDate = prompt("Enter future date (YYYY-MM-DD):", currentDueDate || currentDate);
    if (newDueDate === null) return; // User cancelled
    
    // Prompt for time
    newTime = prompt("Enter future time (HH:MM):", currentTime || currentTimePlus);
    if (newTime === null) return; // User cancelled
    
    // Validate the date and time are in the future
    if (isDateTimeFuture(newDueDate, newTime)) {
      validDateTime = true;
    } else {
      alert("Error: Due date and time must be in the future. Please try again.");
    }
  }
  
  // Update the DOM
  taskDiv.querySelector('.todo-item').innerText = newText;
  
  // Create or update the due date span
  const newDueSpan = document.createElement('span');
  newDueSpan.classList.add('due-date');
  let displayText = `Due: ${newDueDate} at ${newTime}`;
  newDueSpan.innerText = displayText;
  
  // Replace or add the due date span
  if (currentDueSpan) {
    taskDiv.replaceChild(newDueSpan, currentDueSpan);
  } else {
    taskDiv.insertBefore(newDueSpan, taskDiv.querySelector('.check-btn'));
  }
  
  // Update the task in local storage
  updateLocalTask(taskId, newText, newDueDate, newTime);
  
  // Confirm successful edit
  alert("Task updated successfully!");
}

// Save a task object to local storage
function savelocal(task) {
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  todos.push(task);
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Get tasks from local storage
function getLocalTodos() {
  return JSON.parse(localStorage.getItem('todos')) || [];
}

// Update a task in local storage by its id
function updateLocalTask(taskId, newText, newDueDate, newTime) {
  let todos = getLocalTodos();
  todos = todos.map(task => {
    if (task.id === taskId) {
      return { ...task, text: newText, dueDate: newDueDate, time: newTime };
    }
    return task;
  });
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Remove a task from local storage by its id
function removeLocalTask(taskId) {
  let todos = getLocalTodos();
  todos = todos.filter(task => task.id !== taskId);
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Render all tasks in the DOM (clears the list first)
function renderTasks(tasks) {
  toDoList.innerHTML = "";
  tasks.forEach(task => {
    renderTask(task);
  });
}

// Sort tasks by priority and then due date/time and re-render them
function sortTasks(order) {
  let todos = getLocalTodos();
  if (order === 'asc') {
    // Ascending: group tasks from high priority to low
    todos.sort((a, b) => {
      let priorityComparison = priorityMap[a.priority] - priorityMap[b.priority];
      if (priorityComparison !== 0) return priorityComparison;
      // If same priority, sort by due date/time ascending
      const dateTimeA = new Date(a.dueDate + "T" + a.time);
      const dateTimeB = new Date(b.dueDate + "T" + b.time);
      return dateTimeA - dateTimeB;
    });
  } else {
    // Descending: group tasks from low priority to high
    todos.sort((a, b) => {
      let priorityComparison = priorityMap[b.priority] - priorityMap[a.priority];
      if (priorityComparison !== 0) return priorityComparison;
      // If same priority, sort by due date/time descending
      const dateTimeA = new Date(a.dueDate + "T" + a.time);
      const dateTimeB = new Date(b.dueDate + "T" + b.time);
      return dateTimeB - dateTimeA;
    });
  }
  renderTasks(todos);
}

// Change the theme of the page and update task/button classes accordingly
function changeTheme(color) {
  localStorage.setItem('savedTheme', color);
  savedTheme = localStorage.getItem('savedTheme');
  document.body.className = color;
  
  // Adjust title style for darker theme if applicable
  const titleEl = document.getElementById('title');
  if (titleEl) {
    if (color === 'darker') {
      titleEl.classList.add('darker-title');
    } else {
      titleEl.classList.remove('darker-title');
    }
  }
  
  // Update input field theme
  const inputField = document.querySelector('input');
  if (inputField) {
    inputField.className = `${color}-input`;
  }
  
  // Update existing task containers
  document.querySelectorAll('.todo').forEach(todo => {
    const isCompleted = todo.classList.contains('completed');
    todo.className = `todo ${color}-todo` + (isCompleted ? ' completed' : '');
  });
  
  // Update buttons theme
  document.querySelectorAll('button').forEach(button => {
    if (button.classList.contains('check-btn')) {
      button.className = `check-btn ${color}-button`;
    } else if (button.classList.contains('delete-btn')) {
      button.className = `delete-btn ${color}-button`;
    } else if (button.classList.contains('todo-btn')) {
      button.className = `todo-btn ${color}-button`;
    } else if (button.classList.contains('edit-btn')) {
      button.className = `edit-btn ${color}-button`;
    }
  });
};