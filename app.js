const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const clearCompletedBtn = document.querySelector("#clear-completed");

const tasks = [];

const createId = () =>
(window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random()
  .toString(36)
  .slice(2, 8)}`);

function refreshUI() {
  taskList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  tasks.forEach((task) => {
    fragment.appendChild(createTaskElement(task));
  });

  taskList.appendChild(fragment);
  const hasTasks = tasks.length > 0;
  emptyState.classList.toggle("hidden", hasTasks);

  const completedCount = tasks.filter((task) => task.done).length;
  clearCompletedBtn.disabled = completedCount === 0;
  clearCompletedBtn.textContent = completedCount
    ? `Clear ${completedCount} completed`
    : "Clear completed";
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task";
  if (task.done) li.classList.add("task--done");
  li.dataset.id = task.id;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "task__toggle";
  toggle.dataset.action = "toggle";
  toggle.setAttribute("aria-pressed", String(task.done));
  toggle.setAttribute(
    "aria-label",
    task.done ? "Mark as not done" : "Mark as done"
  );
  toggle.title = toggle.getAttribute("aria-label");
  toggle.textContent = "";

  const main = document.createElement("div");
  main.className = "task__main";

  const title = document.createElement("p");
  title.className = "task__title";
  title.textContent = task.title;
  main.appendChild(title);

  const actions = document.createElement("div");
  actions.className = "task__actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.dataset.action = "edit";
  editButton.textContent = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Delete";

  actions.append(editButton, deleteButton);
  li.append(toggle, main, actions);

  return li;
}

function addTask(title) {
  tasks.unshift({ id: createId(), title, done: false });
  refreshUI();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  refreshUI();
}

function deleteTask(id) {
  const index = tasks.findIndex((item) => item.id === id);
  if (index === -1) return;
  tasks.splice(index, 1);
  refreshUI();
}

function clearCompleted() {
  const remaining = tasks.filter((task) => !task.done);
  if (remaining.length === tasks.length) return;
  tasks.length = 0;
  tasks.push(...remaining);
  refreshUI();
}

function startEdit(id, listItem) {
  if (!listItem) return;
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  if (listItem.classList.contains("is-editing")) return;

  listItem.classList.add("is-editing");
  const titleEl = listItem.querySelector(".task__title");
  const editor = document.createElement("input");
  editor.type = "text";
  editor.value = task.title;
  editor.maxLength = 120;
  editor.className = "task__editor";
  titleEl.replaceWith(editor);
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);

  const teardown = (commit) => {
    if (!listItem.classList.contains("is-editing")) return;
    listItem.classList.remove("is-editing");
    editor.removeEventListener("blur", onBlur);
    editor.removeEventListener("keydown", onKeyDown);
    if (commit) {
      const nextValue = editor.value.trim();
      if (nextValue) {
        task.title = nextValue;
      }
    }
    refreshUI();
  };

  const onBlur = () => teardown(true);

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      editor.blur();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      editor.value = task.title;
      teardown(false);
    }
  };

  editor.addEventListener("blur", onBlur);
  editor.addEventListener("keydown", onKeyDown);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) {
    taskInput.focus();
    return;
  }
  addTask(value);
  form.reset();
  taskInput.focus();
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const listItem = button.closest(".task");
  const taskId = listItem?.dataset.id;
  if (!taskId) return;

  switch (button.dataset.action) {
    case "toggle":
      toggleTask(taskId);
      break;
    case "edit":
      startEdit(taskId, listItem);
      break;
    case "delete":
      deleteTask(taskId);
      break;
    default:
      break;
  }
});

clearCompletedBtn.addEventListener("click", () => {
  clearCompleted();
  taskInput.focus();
});

refreshUI();
