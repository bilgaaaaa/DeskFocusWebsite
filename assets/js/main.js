/**
 * DeskFocus website: drives the interactive widget preview in the hero
 * (task selection, completion, focus timer) and the app-silencing demo list.
 */
(() => {
  "use strict";

  const LOG_PREFIX = "[DeskFocus]";
  const FOCUS_MINUTES = 25;
  const TIMER_RING_RADIUS = 44;
  const TIMER_RING_LENGTH = 2 * Math.PI * TIMER_RING_RADIUS;
  const SVG_NS = "http://www.w3.org/2000/svg";

  const TASKS = [
    { id: "release-notes", title: "Write release notes", source: "Reminders" },
    { id: "pull-request", title: "Review pull request", source: "Google Tasks" },
    { id: "design-review", title: "Design review call", source: "Calendar" },
    { id: "sprint-demo", title: "Plan sprint demo", source: "Google Tasks" },
  ];

  const APPS = [
    { id: "mail", name: "Mail", muted: true },
    { id: "messages", name: "Messages", muted: false },
    { id: "slack", name: "Slack", muted: true },
    { id: "whatsapp", name: "WhatsApp", muted: true },
  ];

  const state = {
    selectedTaskId: TASKS[0].id,
    doneTaskIds: new Set(["design-review"]),
    mutedAppIds: new Set(APPS.filter((app) => app.muted).map((app) => app.id)),
    totalSeconds: FOCUS_MINUTES * 60,
    remainingSeconds: FOCUS_MINUTES * 60,
    timerId: null,
  };

  const log = (message) => console.info(`${LOG_PREFIX} ${message}`);

  /** Returns the element for a data attribute selector, or null when the section is absent. */
  const query = (name) => document.querySelector(`[${name}]`);

  const elements = {
    widget: query("data-widget"),
    taskList: query("data-task-list"),
    progress: query("data-widget-progress"),
    selectedTitle: query("data-selected-title"),
    timerLabel: query("data-timer-label"),
    timerRing: query("data-timer-ring"),
    timerToggle: query("data-timer-toggle"),
    timerReset: query("data-timer-reset"),
    mutedSummary: query("data-muted-summary"),
    appList: query("data-app-list"),
    currentYear: query("data-current-year"),
  };

  // ---------- Timer ----------

  const isTimerRunning = () => state.timerId !== null;

  const formatTime = (seconds) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const rest = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
  };

  const renderTimer = () => {
    const progress = state.remainingSeconds / state.totalSeconds;
    elements.timerLabel.textContent = formatTime(state.remainingSeconds);
    elements.timerRing.style.strokeDashoffset = String(TIMER_RING_LENGTH * (1 - progress));

    if (state.remainingSeconds === 0) {
      elements.timerToggle.textContent = "Again";
    } else {
      elements.timerToggle.textContent = isTimerRunning() ? "Pause" : "Start";
    }
  };

  const stopTimer = () => {
    if (!isTimerRunning()) return;
    clearInterval(state.timerId);
    state.timerId = null;
  };

  const tickTimer = () => {
    state.remainingSeconds = Math.max(0, state.remainingSeconds - 1);
    if (state.remainingSeconds === 0) {
      stopTimer();
      log("Focus session finished");
    }
    renderTimer();
  };

  const startTimer = () => {
    if (isTimerRunning()) return;
    // Restarting after a finished session begins a fresh one.
    if (state.remainingSeconds === 0) state.remainingSeconds = state.totalSeconds;
    state.timerId = setInterval(tickTimer, 1000);
    log(`Timer started for "${getSelectedTask().title}"`);
  };

  const toggleTimer = () => {
    if (isTimerRunning()) {
      stopTimer();
      log("Timer paused");
    } else {
      startTimer();
    }
    renderTimer();
  };

  const resetTimer = () => {
    stopTimer();
    state.remainingSeconds = state.totalSeconds;
    log("Timer reset");
    renderTimer();
  };

  // ---------- Tasks ----------

  const getSelectedTask = () => TASKS.find((task) => task.id === state.selectedTaskId) ?? TASKS[0];

  const selectTask = (taskId) => {
    if (taskId === state.selectedTaskId) return;
    // Switching tasks starts that task's timer from the beginning.
    state.selectedTaskId = taskId;
    stopTimer();
    state.remainingSeconds = state.totalSeconds;
    log(`Selected task "${getSelectedTask().title}"`);
    renderTasks();
    renderTimer();
  };

  const toggleTaskDone = (taskId) => {
    if (state.doneTaskIds.has(taskId)) {
      state.doneTaskIds.delete(taskId);
    } else {
      state.doneTaskIds.add(taskId);
    }
    renderTasks();
  };

  const createCheckIcon = () => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("viewBox", "0 0 22 22");
    svg.setAttribute("aria-hidden", "true");

    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("class", "task__check-circle");
    circle.setAttribute("cx", "11");
    circle.setAttribute("cy", "11");
    circle.setAttribute("r", "10");

    const mark = document.createElementNS(SVG_NS, "path");
    mark.setAttribute("class", "task__check-mark");
    mark.setAttribute("d", "m6.5 11.2 3 3 6-6.4");

    svg.append(circle, mark);
    return svg;
  };

  const createTaskItem = (task) => {
    const isDone = state.doneTaskIds.has(task.id);
    const isSelected = task.id === state.selectedTaskId;

    const item = document.createElement("li");
    item.className = isDone ? "task task--done" : "task";

    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = "task__check";
    checkButton.setAttribute("aria-label", `${isDone ? "Mark not done" : "Mark done"}: ${task.title}`);
    checkButton.append(createCheckIcon());
    checkButton.addEventListener("click", () => toggleTaskDone(task.id));

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "task__select";
    selectButton.setAttribute("aria-pressed", String(isSelected));
    selectButton.addEventListener("click", () => selectTask(task.id));

    const title = document.createElement("span");
    title.className = "task__title";
    title.textContent = task.title;

    const source = document.createElement("span");
    source.className = "task__source";
    source.textContent = task.source;

    selectButton.append(title, source);
    item.append(checkButton, selectButton);
    return item;
  };

  const renderTasks = () => {
    elements.taskList.replaceChildren(...TASKS.map(createTaskItem));
    elements.progress.textContent = `${state.doneTaskIds.size} of ${TASKS.length} done`;
    elements.selectedTitle.textContent = getSelectedTask().title;
  };

  // ---------- Apps ----------

  const renderMutedSummary = () => {
    if (!elements.mutedSummary) return;
    const mutedNames = APPS.filter((app) => state.mutedAppIds.has(app.id)).map((app) => app.name);
    elements.mutedSummary.textContent = mutedNames.length
      ? `Muted during focus: ${mutedNames.join(" · ")}`
      : "No apps muted";
  };

  const toggleAppMuted = (appId, isMuted) => {
    if (isMuted) {
      state.mutedAppIds.add(appId);
    } else {
      state.mutedAppIds.delete(appId);
    }
    renderMutedSummary();
  };

  const createAppToggle = (app) => {
    const label = document.createElement("label");
    label.className = "app-toggle";

    const name = document.createElement("span");
    name.textContent = app.name;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "app-toggle__input";
    input.checked = state.mutedAppIds.has(app.id);
    input.addEventListener("change", () => toggleAppMuted(app.id, input.checked));

    label.append(name, input);
    return label;
  };

  const renderApps = () => {
    if (elements.appList) {
      elements.appList.replaceChildren(...APPS.map(createAppToggle));
    }
    renderMutedSummary();
  };

  // ---------- Init ----------

  const initWidget = () => {
    if (!elements.widget) return;

    elements.timerRing.style.strokeDasharray = String(TIMER_RING_LENGTH);
    elements.timerToggle.addEventListener("click", toggleTimer);
    elements.timerReset.addEventListener("click", resetTimer);

    renderTasks();
    renderTimer();
    log("Widget preview ready");
  };

  if (elements.currentYear) {
    elements.currentYear.textContent = String(new Date().getFullYear());
  }

  initWidget();
  renderApps();
})();
