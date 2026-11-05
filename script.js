// ==========================================
// STUDYFLOW - STUDENT STUDY PLANNER
// ==========================================

// DOM Elements
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskSubject = document.getElementById("taskSubject");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const scheduleList = document.getElementById("scheduleList");

const searchTask = document.getElementById("searchTask");
const taskFilter = document.getElementById("taskFilter");

const editTaskId = document.getElementById("editTaskId");
const formHeading = document.getElementById("formHeading");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

// ==========================================
// DATE HELPERS
// ==========================================

function getLocalDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(dateString) {
    return parseDate(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ==========================================
// LOCAL STORAGE
// ==========================================

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("studyFlowTasks")
    );

    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("studyFlowTasks", JSON.stringify(tasks));
}

// ==========================================
// TASK ID
// ==========================================

function createTaskId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return Date.now().toString() + Math.random().toString(16).slice(2);
}

// ==========================================
// CURRENT DATE
// ==========================================

function displayCurrentDate() {
    const today = new Date();

    document.getElementById("currentDate").textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    taskDate.min = getLocalDate();
    taskDate.value = getLocalDate();
}

// ==========================================
// ADD AND EDIT TASKS
// ==========================================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const subject = taskSubject.value;
    const priority = taskPriority.value;
    const dueDate = taskDate.value;

    if (!title || !subject || !dueDate) {
        alert("Please fill all required fields.");
        return;
    }

    const today = getLocalDate();

    if (dueDate < today) {
        alert("Please select today or a future date.");
        return;
    }

    // Edit existing task
    if (editTaskId.value) {

        const task = tasks.find(
            item => item.id === editTaskId.value
        );

        if (task) {
            task.title = title;
            task.subject = subject;
            task.priority = priority;
            task.dueDate = dueDate;
        }

    } else {

        // Add new task
        const newTask = {
            id: createTaskId(),
            title: title,
            subject: subject,
            priority: priority,
            dueDate: dueDate,
            completed: false,
            createdAt: today
        };

        tasks.push(newTask);
    }

    saveTasks();
    resetForm();
    renderApp();
});

// ==========================================
// RESET FORM
// ==========================================

function resetForm() {
    taskForm.reset();

    editTaskId.value = "";
    formHeading.textContent = "Add Study Task";
    submitButton.innerHTML = "＋ Add Task";

    cancelEdit.hidden = true;

    taskDate.min = getLocalDate();
    taskDate.value = getLocalDate();
    taskPriority.value = "Medium";
}

// ==========================================
// EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    editTaskId.value = task.id;
    taskTitle.value = task.title;
    taskSubject.value = task.subject;
    taskPriority.value = task.priority;
    taskDate.value = task.dueDate;

    taskDate.min = "";

    formHeading.textContent = "Edit Study Task";
    submitButton.innerHTML = "✓ Update Task";

    cancelEdit.hidden = false;

    document.getElementById("taskFormSection").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    taskTitle.focus();
}

// ==========================================
// CANCEL EDIT
// ==========================================

cancelEdit.addEventListener("click", resetForm);

// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    tasks = tasks.filter(item => item.id !== id);

    if (editTaskId.value === id) {
        resetForm();
    }

    saveTasks();
    renderApp();
}

// ==========================================
// COMPLETE / UNCOMPLETE TASK
// ==========================================

function toggleTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    renderApp();
}

// ==========================================
// TASK FILTERS
// ==========================================

let currentFilter = "all";

function setFilter(filter) {

    currentFilter = filter;

    taskFilter.value = filter;

    document.querySelectorAll(".filter-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    renderTasks();
}

document.querySelectorAll(".filter-link").forEach(button => {

    button.addEventListener("click", function () {

        setFilter(this.dataset.filter);

        document.getElementById("tasks").scrollIntoView({
            behavior: "smooth"
        });
    });

});

taskFilter.addEventListener("change", function () {
    setFilter(this.value);
});

// ==========================================
// SEARCH TASKS
// ==========================================

searchTask.addEventListener("input", renderTasks);

// ==========================================
// RENDER TASKS
// ==========================================

function renderTasks() {

    const searchValue = searchTask.value.toLowerCase().trim();

    let filteredTasks = [...tasks];

    if (currentFilter === "pending") {
        filteredTasks = filteredTasks.filter(
            task => !task.completed
        );
    }

    if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(
            task => task.completed
        );
    }

    filteredTasks = filteredTasks.filter(task => {
        return (
            task.title.toLowerCase().includes(searchValue) ||
            task.subject.toLowerCase().includes(searchValue)
        );
    });

    // Sort by due date
    filteredTasks.sort((a, b) => {
        return a.dueDate.localeCompare(b.dueDate);
    });

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <div>✎</div>
                <h3>No matching tasks found</h3>
                <p>Try another search or add a new study task.</p>
            </div>
        `;

        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {

        const safeTitle = escapeHTML(task.title);
        const safeSubject = escapeHTML(task.subject);
        const safePriority = escapeHTML(task.priority);

        return `
            <div class="task-item ${task.completed ? "completed" : ""}">

                <input
                    type="checkbox"
                    class="task-check"
                    ${task.completed ? "checked" : ""}
                    aria-label="Mark ${safeTitle} as completed"
                    onchange="toggleTask('${task.id}')"
                >

                <div class="task-details">
                    <h4>${safeTitle}</h4>
                    <p>${safeSubject} · Due ${formatDate(task.dueDate)}</p>
                </div>

                <div class="task-meta">

                    <span class="subject-tag">
                        ${safeSubject}
                    </span>

                    <span class="priority ${safePriority}">
                        ${safePriority}
                    </span>

                    <div class="task-actions">

                        <button
                            class="action-button"
                            onclick="editTask('${task.id}')"
                            aria-label="Edit task"
                            title="Edit Task"
                        >✎</button>

                        <button
                            class="action-button delete"
                            onclick="deleteTask('${task.id}')"
                            aria-label="Delete task"
                            title="Delete Task"
                        >✕</button>

                    </div>
                </div>

            </div>
        `;

    }).join("");
}

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function renderStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const today = getLocalDate();

    const todayTasks = tasks.filter(
        task => task.dueDate === today
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("todayTasks").textContent = todayTasks;
    document.getElementById("allCount").textContent = total;
}

// ==========================================
// DAILY PROGRESS
// ==========================================

function renderProgress() {

    const today = getLocalDate();

    const todaysTasks = tasks.filter(
        task => task.dueDate === today
    );

    const total = todaysTasks.length;

    const completed = todaysTasks.filter(
        task => task.completed
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progressPercentage").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";

    let message = "Start completing tasks to track your progress!";

    if (percentage === 100 && total > 0) {
        message = "Amazing! You completed all today's tasks. 🎉";
    } else if (percentage >= 50) {
        message = "Great progress! Keep up the good work.";
    } else if (percentage > 0) {
        message = "Good start! Keep moving towards your goals.";
    }

    document.getElementById("progressMessage").textContent = message;
}

// ==========================================
// WEEKLY PROGRESS
// ==========================================

function renderWeeklyProgress() {

    const today = new Date();
    const currentDay = today.getDay();

    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const weekTasks = [];

    let completedWeekTasks = 0;

    for (let i = 0; i < 7; i++) {

        const date = new Date(monday);
        date.setDate(monday.getDate() + i);

        const dateString = getLocalDate(date);

        const dayTasks = tasks.filter(
            task => task.dueDate === dateString
        );

        const done = dayTasks.filter(
            task => task.completed
        ).length;

        completedWeekTasks += done;

        weekTasks.push({
            date: dateString,
            day: date.toLocaleDateString("en-IN", {
                weekday: "short"
            }),
            number: date.getDate(),
            total: dayTasks.length,
            done: done
        });
    }

    const totalWeekTasks = weekTasks.reduce(
        (sum, day) => sum + day.total,
        0
    );

    const percentage = totalWeekTasks === 0
        ? 0
        : Math.round(
            (completedWeekTasks / totalWeekTasks) * 100
        );

    document.getElementById("weeklyPercentage").textContent =
        percentage + "% completed";

    document.getElementById("weekDays").innerHTML =
        weekTasks.map(day => {

            const isToday = day.date === getLocalDate();

            return `
                <div class="day-item ${isToday ? "today" : ""}">
                    <span>${day.day}</span>
                    <strong>${day.number}</strong>
                    <small>${day.done}/${day.total}</small>
                </div>
            `;

        }).join("");
}

// ==========================================
// WEEKLY SCHEDULE
// ==========================================

function renderSchedule() {

    const today = getLocalDate();

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextWeekString = getLocalDate(nextWeek);

    const upcomingTasks = tasks
        .filter(task => {
            return (
                !task.completed &&
                task.dueDate >= today &&
                task.dueDate <= nextWeekString
            );
        })
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 8);

    if (upcomingTasks.length === 0) {

        scheduleList.innerHTML = `
            <div class="empty-state">
                <div>▦</div>
                <h3>No upcoming tasks</h3>
                <p>Your next seven days are clear!</p>
            </div>
        `;

        return;
    }

    scheduleList.innerHTML = upcomingTasks.map(task => {

        const date = parseDate(task.dueDate);

        const day = date.getDate();

        const month = date.toLocaleDateString("en-IN", {
            month: "short"
        });

        return `
            <div class="schedule-item">

                <div class="schedule-date">
                    <strong>${day}</strong>
                    ${month}
                </div>

                <div class="schedule-info">
                    <h4>${escapeHTML(task.title)}</h4>
                    <p>${escapeHTML(task.subject)} · ${escapeHTML(task.priority)} Priority</p>
                </div>

                <span class="schedule-status">Pending</span>

            </div>
        `;

    }).join("");
}

// ==========================================
// THEME TOGGLE
// ==========================================

function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle("dark", isDark);

    themeIcon.textContent = isDark ? "☀" : "☾";

    themeText.textContent = isDark ? "Light Mode" : "Dark Mode";

    localStorage.setItem("studyFlowTheme", theme);
}

const savedTheme = localStorage.getItem("studyFlowTheme") || "light";

applyTheme(savedTheme);

themeToggle.addEventListener("click", function () {

    const newTheme = document.body.classList.contains("dark")
        ? "light"
        : "dark";

    applyTheme(newTheme);
});

// ==========================================
// TOP ADD BUTTON
// ==========================================

document.getElementById("topAddButton").addEventListener("click", function () {

    if (editTaskId.value) {
        resetForm();
    }

    document.getElementById("taskFormSection").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    setTimeout(() => taskTitle.focus(), 400);
});

// ==========================================
// NAVIGATION
// ==========================================

document.querySelectorAll('a.nav-link[href^="#"]').forEach(link => {

    link.addEventListener("click", function () {

        document.querySelectorAll('a.nav-link').forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });

});

// ==========================================
// RENDER COMPLETE APPLICATION
// ==========================================

function renderApp() {

    renderStatistics();

    renderTasks();

    renderProgress();

    renderWeeklyProgress();

    renderSchedule();
}

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

displayCurrentDate();

renderApp();