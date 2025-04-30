document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-description");
  const deadlineInput = document.getElementById("task-deadline");
  const taskList = document.getElementById("task-list");
  const optimizeButton = document.getElementById("optimize-button");
  const noTasksMessage = document.getElementById("no-tasks-message");
  const loadingSpinner = document.getElementById("loading-spinner");
  const toastContainer = document.getElementById("toast-container");

  let tasks = [];

  function loadTasks() {
    const storedTasks = localStorage.getItem("dayCompassTasks");
    if (storedTasks) {
      try {
        tasks = JSON.parse(storedTasks);
      } catch (e) {
        console.error("Error parsing tasks from localStorage:", e);
        tasks = [];
      }
    }
    renderTasks();
  }

  function saveTasks() {
    localStorage.setItem("dayCompassTasks", JSON.stringify(tasks));
  }

  function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
      noTasksMessage.style.display = "block";
      optimizeButton.disabled = true;
      return;
    }

    noTasksMessage.style.display = "none";
    optimizeButton.disabled = tasks.filter((t) => !t.completed).length < 2;

    const incompleteTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    [...incompleteTasks, ...completedTasks].forEach((task) => {
      const listItem = document.createElement("li");
      listItem.className = `flex items-center justify-between p-3 bg-white border rounded-md shadow-sm ${
        task.completed ? "border-green-200 opacity-70" : "border-gray-200"
      }`;
      listItem.dataset.taskId = task.id;

      const taskContent = document.createElement("div");
      taskContent.className = "flex-grow mr-4";

      const descriptionSpan = document.createElement("span");
      descriptionSpan.textContent = task.description;
      descriptionSpan.className = `block ${task.completed ? "completed" : ""}`;
      taskContent.appendChild(descriptionSpan);

      if (task.deadline) {
        const deadlineSpan = document.createElement("span");
        deadlineSpan.className = "block text-xs mt-1";
        try {
          const deadlineDate = new Date(task.deadline + "T00:00:00");
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let badgeClass = "badge-secondary";
          let badgeText = `Due: ${formatDate(deadlineDate)}`;
          const timeDiff = deadlineDate.getTime() - today.getTime();

          if (timeDiff < 0) {
            badgeClass = "badge-destructive";
            badgeText = "Overdue";
          } else if (timeDiff === 0) {
            badgeClass = "badge-today";
            badgeText = "Today";
          }

          deadlineSpan.innerHTML = `<span class="${badgeClass}"><i class="fas fa-calendar-alt mr-1"></i>${badgeText}</span>`;
          taskContent.appendChild(deadlineSpan);
        } catch (e) {
          console.error("Error processing deadline:", task.deadline, e);
        }
      }

      if (task.reason) {
        const reasonSpan = document.createElement("span");
        reasonSpan.textContent = `(${task.reason})`;
        reasonSpan.className = "block text-xs text-gray-500 mt-1 italic";
        taskContent.appendChild(reasonSpan);
      }

      listItem.appendChild(taskContent);

      const buttonGroup = document.createElement("div");
      buttonGroup.className = "flex items-center space-x-1";

      const completeButton = document.createElement("button");
      completeButton.className = `btn-ghost ${
        task.completed ? "text-green-500" : "text-gray-400 hover:text-green-500"
      }`;
      completeButton.innerHTML = task.completed
        ? '<i class="fas fa-check-circle fa-lg"></i>'
        : '<i class="far fa-circle fa-lg"></i>';
      completeButton.setAttribute(
        "aria-label",
        task.completed ? "Mark as incomplete" : "Mark as complete"
      );
      completeButton.title = task.completed
        ? "Mark as incomplete"
        : "Mark as complete";
      completeButton.addEventListener("click", () => toggleComplete(task.id));
      buttonGroup.appendChild(completeButton);

      const removeButton = document.createElement("button");
      removeButton.className = "btn-ghost text-gray-400 hover:text-red-500";
      removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
      removeButton.setAttribute("aria-label", "Remove task");
      removeButton.title = "Remove task";
      removeButton.addEventListener("click", () => removeTask(task.id));
      buttonGroup.appendChild(removeButton);

      listItem.appendChild(buttonGroup);

      taskList.appendChild(listItem);
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function addTask(event) {
    event.preventDefault();

    const description = taskInput.value.trim();
    const deadline = deadlineInput.value;

    if (!description) {
      showToast("Please enter a task description.", "destructive");
      return;
    }

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      description: description,
      deadline: deadline || null,
      completed: false,
      reason: "",
    };

    tasks.push(newTask);
    taskInput.value = "";
    deadlineInput.value = "";
    saveTasks();
    renderTasks();
    showToast(`Task "${description}" added.`, "accent");
  }

  function toggleComplete(id) {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex > -1) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      tasks[taskIndex].reason = "";
      saveTasks();
      renderTasks();
      const task = tasks[taskIndex];
      if (task.completed) {
        showToast(`Task "${task.description}" completed!`);
      }
    }
  }

  function removeTask(id) {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex > -1) {
      const taskToRemove = tasks[taskIndex];
      if (
        confirm(
          `Are you sure you want to remove "${taskToRemove.description}"?`
        )
      ) {
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        showToast(`Task "${taskToRemove.description}" removed.`, "destructive");
      }
    }
  }

  function optimizeSchedule() {
    const incompleteTasks = tasks.filter((task) => !task.completed);
    if (incompleteTasks.length < 2) {
      showToast("Need at least two incomplete tasks to optimize.");
      return;
    }

    loadingSpinner.style.display = "block";
    optimizeButton.disabled = true;
    taskList.style.opacity = "0.5";

    setTimeout(() => {
      const sortedIncomplete = [...incompleteTasks].sort((a, b) => {
        const deadlineA = a.deadline
          ? new Date(a.deadline + "T00:00:00").getTime()
          : Infinity;
        const deadlineB = b.deadline
          ? new Date(b.deadline + "T00:00:00").getTime()
          : Infinity;

        if (deadlineA === deadlineB) {
          return 0;
        }
        return deadlineA - deadlineB;
      });

      const optimizedTasksWithReason = sortedIncomplete.map((task, index) => {
        let reason = "Suggested order";
        if (index === 0 && task.deadline) {
          reason = "Closest deadline";
        } else if (task.deadline) {
          reason = "Next deadline";
        } else if (
          !task.deadline &&
          index === 0 &&
          sortedIncomplete.length === 1
        ) {
          reason = "No deadline";
        } else if (!task.deadline) {
          reason = "No deadline (lower priority)";
        }
        if (task.completed) {
          reason = "";
        }
        return { ...task, reason: reason };
      });

      const completedTasks = tasks.filter((task) => task.completed);
      tasks = [...optimizedTasksWithReason, ...completedTasks];

      loadingSpinner.style.display = "none";
      taskList.style.opacity = "1";

      saveTasks();
      renderTasks();
      showToast("Schedule optimized (sorted by deadline).", "accent");
      optimizeButton.disabled = tasks.filter((t) => !t.completed).length < 2;
    }, 1000);
  }

  function showToast(message, type = "primary") {
    const toastElement = document.createElement("div");
    toastElement.textContent = message;

    let toastClass = "toast-primary";
    if (type === "destructive") {
      toastClass = "toast-destructive";
    } else if (type === "accent") {
      toastClass = "toast-accent";
    }

    toastElement.className = `toast ${toastClass} opacity-0`;

    toastContainer.appendChild(toastElement);

    void toastElement.offsetWidth;

    toastElement.classList.remove("opacity-0");
    toastElement.classList.add("opacity-100");

    setTimeout(() => {
      toastElement.classList.remove("opacity-100");
      toastElement.classList.add("opacity-0");
      setTimeout(() => {
        if (toastElement.parentNode === toastContainer) {
          toastContainer.removeChild(toastElement);
        }
      }, 350);
    }, 3000);
  }

  taskForm.addEventListener("submit", addTask);
  optimizeButton.addEventListener("click", optimizeSchedule);

  loadTasks();
});
