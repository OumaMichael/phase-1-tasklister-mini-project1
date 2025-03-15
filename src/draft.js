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

// ------------------ Event Listeners ------------------
if (form) form.addEventListener('submit', addToDo);
if (toDoList) toDoList.addEventListener('click', taskAction);
document.addEventListener("DOMContentLoaded", () => {
  renderTasks(getLocalTodos());
});

// Theme change buttons
if (standardTheme) standardTheme.addEventListener('click', () => changeTheme('standard'));
if (lightTheme) lightTheme.addEventListener('click', () => changeTheme('light'));
if (darkerTheme) darkerTheme.addEventListener('click', () => changeTheme('darker'));

// Sort buttons
if (sortAscBtn) sortAscBtn.addEventListener('click', () => sortTasks('asc'));
if (sortDescBtn) sortDescBtn.addEventListener('click', () => sortTasks('desc'));

// Check if a theme has been set previously (default to standard)
let savedTheme = localStorage.getItem('savedTheme') || 'standard';
changeTheme(savedTheme);

// Mapping for priority order (lower number = higher priority)
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
  
  const taskId = Date.now(); // Unique ID for the task
  const task = {
    id: taskId,
    text: toDoInput.value,
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
    time: timeInput.value
  };
  
  // Save to local storage and render the new task
  savelocal(toDoInput.value);
  renderTask(toDoInput.value);
// check btn;
const checked = document.createElement('button');
checked.innerHTML = '<i class="fas fa-check"></i>';
checked.classList.add('check-btn', `${savedTheme}-button`);
toDoDiv.appendChild(checked);
// delete btn;
const deleted = document.createElement('button');
deleted.innerHTML = '<i class="fas fa-trash"></i>';
deleted.classList.add('delete-btn', `${savedTheme}-button`);
toDoDiv.appendChild(deleted);

// Append to list;
toDoList.appendChild(toDoDiv);

// CLearing the input;
toDoInput.value = '';
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

// Handle check, edit, and delete actions via event delegation
function taskAction(event) {
  const item = event.target;
  // Get the parent task container
  const taskDiv = item.closest('.todo');
  if (!taskDiv) return;
  const taskId = Number(taskDiv.getAttribute('data-id'));
  
  // Delete functionality
  if (item.classList.contains('delete-btn')) {
    if (confirm("Are you sure you want to delete this task?")) {
      taskDiv.classList.add("fall");
      // Remove from local storage so it doesn't reappear after refresh
      removeLocalTask(taskId);
      // Wait for transition to complete before removing from DOM
      taskDiv.addEventListener('transitionend', function(){
        taskDiv.remove();
      });
    }
  }
  
  // Check functionality: toggle completed class
  if (item.classList.contains('check-btn')) {
    taskDiv.classList.toggle("completed");
  }
  
  // Edit functionality: prompt for new values immediately
  if (item.classList.contains('edit-btn')) {
    if (confirm("Warning: Editing this task will permanently overwrite its current values. Do you wish to continue?")) {
      editTask(taskDiv, taskId);
    }
  }
}

// Edit a task and update both the DOM and local storage
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
  // Saving to local storage:
function savelocal(todo){
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}



function getTodos() {
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todos.forEach(function(todo) {
        // toDo DIV;
        const toDoDiv = document.createElement("div");
        toDoDiv.classList.add("todo", `${savedTheme}-todo`);

        // Create LI
        const newToDo = document.createElement('li');
        
        newToDo.innerText = todo;
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);

        // check btn;
        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check"></i>';
        checked.classList.add("check-btn", `${savedTheme}-button`);
        toDoDiv.appendChild(checked);
        // delete btn;
        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add("delete-btn", `${savedTheme}-button`);
        toDoDiv.appendChild(deleted);

        // Append to list;
        toDoList.appendChild(toDoDiv);
    });
}


function removeLocalTodos(todo){
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    const todoIndex =  todos.indexOf(todo.children[0].innerText);
    // console.log(todoIndex);
    todos.splice(todoIndex, 1);
    // console.log(todos);
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Change theme function:
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');

    document.body.className = color;
    // Change blinking cursor for darker theme:
    color === 'darker' ? 
        document.getElementById('title').classList.add('darker-title')
        : document.getElementById('title').classList.remove('darker-title');

    document.querySelector('input').className = `${color}-input`;
    // Change todo color without changing their status (completed or not):
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ? 
            todo.className = `todo ${color}-todo completed`
            : todo.className = `todo ${color}-todo`;
    });
    // Change buttons color according to their type (todo, check or delete):
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
              button.className = `check-btn ${color}-button`;  
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`; 
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            }
        });
    });
}
  // Prompt user for new values (responds quickly)
  const newText = prompt("Edit the task:", currentText);
  if (newText === null || newText.trim() === "") return; // Cancelled or empty
  
  let newDueDate = prompt("Edit the due date (YYYY-MM-DD):", currentDueDate);
  if (newDueDate === null) newDueDate = currentDueDate;
  
  let newTime = prompt("Edit the time (HH:MM):", currentTime);
  if (newTime === null) newTime = currentTime;
  
  // Update the DOM
  taskDiv.querySelector('.todo-item').innerText = newText;
  if (newDueDate || newTime) {
    const newDueSpan = document.createElement('span');
    newDueSpan.classList.add('due-date');
    let displayText = 'Due: ';
    if (newDueDate) {
      displayText += newDueDate;
    }
    if (newTime) {
      displayText += ' at ' + newTime;
    }
    newDueSpan.innerText = displayText;
    // Replace the old due-date span if it exists; otherwise, insert before the check button
    if (currentDueSpan) {
      taskDiv.replaceChild(newDueSpan, currentDueSpan);
    } else {
      taskDiv.insertBefore(newDueSpan, taskDiv.querySelector('.check-btn'));
    }
  } else {
    if (currentDueSpan) currentDueSpan.remove();
  }
  
  // Update the task in local storage
  updateLocalTask(taskId, newText, newDueDate, newTime);
}

// ------------------ Local Storage Functions ------------------

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

// Update a task in local storage by id
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

// Remove a task from local storage by id
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

// ------------------ Sorting and Theming ------------------

// Sort tasks by priority then due date/time and re-render them
function sortTasks(order) {
  let todos = getLocalTodos();
  if (order === 'asc') {
    // Ascending: high priority tasks come first
    todos.sort((a, b) => {
      let priorityComparison = priorityMap[a.priority] - priorityMap[b.priority];
      if (priorityComparison !== 0) return priorityComparison;
      // If same priority, sort by due date/time ascending
      const dateTimeA = new Date(a.dueDate + "T" + a.time);
      const dateTimeB = new Date(b.dueDate + "T" + b.time);
      return dateTimeA - dateTimeB;
    });
  } else {
    // Descending: low priority tasks come first
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
  
  // Adjust title style if needed
  const titleEl = document.getElementById('title');
  if (titleEl) {
    if (color === 'darker') {
      titleEl.classList.add('darker-title');
    } else {
      titleEl.classList.remove('darker-title');
    }
  }
  
  // Update input field theme (if there's an input field to update)
  const inputField = document.querySelector('input');
  if (inputField) {
    inputField.className = `${color}-input`;
  }
  
  // Update existing task containers with new theme
  document.querySelectorAll('.todo').forEach(todo => {
    const isCompleted = todo.classList.contains('completed');
    todo.className = `todo ${color}-todo` + (isCompleted ? ' completed' : '');
  });
  
  // Update all buttons with the new theme
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
}
