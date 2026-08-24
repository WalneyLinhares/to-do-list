class Task {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.isCompleted = data.isCompleted;
        this.color = data.color;
    }
}

class TaskManager {
    #tasks = [];
    #colorsClass = ['cor-orange', 'cor-purple', 'cor-cyan', 'cor-green',
        'cor-pink', 'cor-red', 'cor-yellow', 'cor-blue', 'cor-black'];

    constructor() {
        this.#loadFromLocalStorage();
    }

    addTask(task) {
        this.#tasks.push(task);
        this.#saveToLocalStorage();
    }

    removeTask(taskId) {
        this.#tasks = this.#tasks.filter(task => task.id !== taskId);
        this.#saveToLocalStorage();
    }

    editTitle(taskId, newTitle) {
        const task = this.#tasks.find(t => t.id === taskId);

        if (task) {
            task.title = newTitle;
            this.#saveToLocalStorage();
        }
    }

    taskToggleCompleted(taskId) {
        const task = this.#tasks.find(t => t.id === taskId);

        if (task) {
            task.isCompleted = !task.isCompleted;
            this.#saveToLocalStorage();
        }
    }

    changeTaskColor(taskId, newColorIndex) {
        const task = this.#tasks.find(t => t.id === taskId);
        if (task) {
            task.color = newColorIndex;
            this.#saveToLocalStorage();
        }
    }

    getTasks() {
        return this.#tasks;
    }

    #saveToLocalStorage() {
        localStorage.setItem('@taskApp:tasks', JSON.stringify(this.#tasks));
    }

    #loadFromLocalStorage() {
        const savedData = localStorage.getItem('@taskApp:tasks');

        if (!savedData) return;

        const rawTasks = JSON.parse(savedData);
        this.#tasks = rawTasks.map(data => new Task(data));
    }

    get colorsList() {
        return this.#colorsClass;
    }

    get totalTasks() {
        return this.#tasks.length;
    }

    get tasksIsComplete() {
        return this.#tasks.reduce((total, task) => task.isCompleted ? total + 1 : total, 0);
    }

    get taskColor() {
        let currentColor = this.getTasks().length;
        return currentColor % this.#colorsClass.length;
    }

    taskColorClass(color) {
        return this.#colorsClass[color];
    }
}

class TaskPanel  {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.form = document.querySelector('.form');
        this.inputTarefa = document.querySelector('#input-tarefa');
        this.tasksContainer = document.querySelector('#container-tarefas');
        this.totalTasks = document.querySelector('#tarefas-total');
        this.tasksCompleted = document.querySelector('#tarefas-concluidas');
        this.colorModal = new ColorPickerModal(
            this.taskManager.colorsList,
            (taskId, colorIndex) => {
                this.taskManager.changeTaskColor(taskId, colorIndex);
                this.renderTasks();
            }
        );
    }

    init() {
        this.form.addEventListener('submit', (event) => this.formToAdd(event));
        this.tasksContainer.addEventListener('click', (event) => this.eventsClick(event));
        this.tasksContainer.addEventListener('keydown', (event) => this.eventsKeys(event));
        this.tasksContainer.addEventListener('focusout', (event) => this.handleTitleBlur(event));
        this.tasksContainer.addEventListener('contextmenu', (event) => this.handleContextMenu(event));
        this.colorModal.init();
        this.renderTasks();
    }

    formToAdd(event) {
        event.preventDefault();

        if (this.inputTarefa.value.trim() === '') return;

        const newTask = {
            id: crypto.randomUUID(),
            title: this.inputTarefa.value,
            isCompleted: false,
            color: this.taskManager.taskColor,
        }

        this.taskManager.addTask(newTask);
        this.renderTasks();
        this.form.reset();
    }

    eventsClick(event) {
        const el = event.target;

        // Botão editar
        if (el.closest('.btn-editar')) {
            const father = el.closest(".tarefas");
            const titleEdit = father.querySelector('.task-title')

            titleEdit.contentEditable = true;
            titleEdit.focus()
            this.selectionRange(titleEdit);
        }

        // Botão remover
        if (el.closest('.btn-excluir')) {
            const fatherElement = el.closest('li');
            if (!fatherElement) return;
            const dataId = fatherElement.dataset.id;

            if (dataId) { this.taskManager.removeTask(dataId) }

            this.renderTasks();
        }

        // Botão checkbox
        if (el.closest('input[type="checkbox"]')) {
            const father = el.closest(".tarefas");
            const buttonBlock = father.querySelector('.btn-editar');
            const dataId = father.getAttribute('data-id');

            if (buttonBlock) {
                buttonBlock.classList.toggle('button-block');
                this.taskManager.taskToggleCompleted(dataId);
            }

            this.renderTasksCount();
        }

    }

    eventsKeys(event) {
        const el = event.target;

        if (event.key === 'Enter' && el.classList.contains('task-title')) {
            event.preventDefault();
            el.blur();
        }
    }

    handleTitleBlur(event) {
        const el = event.target;

        if (el.classList.contains('task-title') && el.isContentEditable) {
            el.contentEditable = false;
            const father = el.closest('.tarefas');
            const taskId = father.dataset.id;
            const newTitle = el.innerText.trim();

            if (newTitle) {
                this.taskManager.editTitle(taskId, newTitle);
            } else {
                this.renderTasks();
            }
        }
    }

    handleContextMenu(event) {
        const fatherElement = event.target.closest('.tarefas');

        if (fatherElement) {
            event.preventDefault();

            const taskId = fatherElement.dataset.id;
            const x = event.clientX;
            const y = event.clientY;

            this.colorModal.open(x, y, taskId);
        }
    }

    selectionRange(el) {
        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(el);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    renderTasks() {
        this.tasksContainer.innerHTML = '';
        const tasks = this.taskManager.getTasks();

        tasks.forEach((task) => {
            const li = document.createElement('li');
            li.classList.add('tarefas');
            li.dataset.id = task.id;

            li.innerHTML = `
            <label>
                <input type="checkbox" ${task.isCompleted ? 'checked' : ''}>
                <span class="checkbox ${this.taskManager.taskColorClass(task.color)}"></span>
                <div class="container-title">
                    <p class="task-title">${task.title}</p>
                </div>
            </label>
            <div class="buttons">
                <button class="btn-editar ${task.isCompleted ? 'button-block' : ''}">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>

                <button class="btn-excluir"> <i class="fa-solid fa-x"></i> </button>
            </div>
            `;

            this.tasksContainer.appendChild(li);
        });

        this.renderTasksCount();
    }

    renderTasksCount() {
        this.totalTasks.textContent = String(taskManager.totalTasks);
        this.tasksCompleted.textContent = String(taskManager.tasksIsComplete);
    }
}

class ColorPickerModal {
    constructor(colorsClass, onSelectColor) {
        this.colorsClass = colorsClass;
        this.onSelectColor = onSelectColor;
        this.currentTaskId = null;
        this.modal = document.createElement('div');
        this.modal.className = 'janela-muda-cor hidden';
        this.#buildHTML();
        this.#initEvents();
    }

    #buildHTML() {
        const colorSpans = this.colorsClass.map((cor, index) => `
            <span class="checkbox ${cor}" data-color-index="${index}"></span>
        `).join('');

        this.modal.innerHTML = `
            <h2>Cores</h2>
            <div class="janela-container">
                ${colorSpans}
            </div>
        `;
    }

    init() {
        if (!document.body.contains(this.modal)) { document.body.appendChild(this.modal) }
    }

    #initEvents() {
        this.modal.addEventListener('click', (event) => {
            const span = event.target.closest('.checkbox');

            if (span && this.currentTaskId) {
                const colorIndex = Number(span.dataset.colorIndex);
                this.onSelectColor(this.currentTaskId, colorIndex);
                this.close();
            }
        });

        document.addEventListener('click', (event) => {
            if (!this.modal.contains(event.target)) {
                this.close();
            }
        });
    }

    open(x, y, taskId) {
        this.currentTaskId = taskId;
        this.modal.style.left = `${x}px`;
        this.modal.style.top = `${y}px`;
        this.modal.classList.remove('hidden');
    }

    close() {
        this.modal.classList.add('hidden');
        this.currentTaskId = null;
    }
}

const taskManager = new TaskManager();
const taskPanel = new TaskPanel(taskManager);
taskPanel.init();