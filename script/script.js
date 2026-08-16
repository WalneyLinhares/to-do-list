function ListApp() {
    this.createElements = function({ element, text, classNames = [], attributes = {} }) {
        const el = document.createElement(element);

        if (text) el.textContent = text;

        if (Array.isArray(classNames)) {
            classNames.forEach(className => {
                if (className) el.classList.add(className);
            });
        }

        Object.entries(attributes).forEach(([key, value]) => {
            if (key in el) {
                el[key] = value;
            } else {
                el.setAttribute(key, String(value));
            }
        });

        return el;
    }

    this.getClassColorCheckbox = function(range) {
        const currentColor = range;
        currentNumberColor = (range + 1) % colors.length;

        return colors[currentColor]
    }

    this.createTask = function(title, taskId = null, completeTask = false, colorTask = null) {
        const colorNumberSave = colorTask ? colorTask : currentNumberColor;
        const classColor = this.getClassColorCheckbox(colorNumberSave);
        const idTask = taskId || crypto.randomUUID();
        let completeTaskClass = completeTask ? ['btn-editar', 'button-block'] : ['btn-editar'];
        const nodes = {}

        // 1. Cria a Div Principal da Tarefa
        nodes.li = this.createElements({
            element: 'li',
            classNames: ['tarefas'],
            attributes: { 'data-id': idTask }
        });

        // 2. Cria o Label e o Checkbox
        nodes.label = this.createElements({ element: 'label' });

        nodes.checkbox = this.createElements({
            element: 'input',
            attributes: {
                type: 'checkbox',
                checked: completeTask
            }
        });

        // 3. Cria o Span customizado com a cor da tarefa
        nodes.span = this.createElements({
            element: 'span',
            classNames: ['checkbox', classColor],
        });

        // 4. Cria o Parágrafo
        nodes.divTitle = this.createElements({
            element: 'div',
            classNames: ['container-title'],
        });

        nodes.pTitle = this.createElements({
            element: 'p',
            text: title,
            classNames: ['task-title'],
            attributes: { 'tabIndex': 0 }
        });

        // 5. Cria a Div dos Botões e os Botões de Ação
        nodes.divButtons = this.createElements({
            element: 'div',
            classNames: ['buttons']
        });

        nodes.btnExcluir = this.createElements({
            element: 'button',
            classNames: ['btn-excluir'],
        });

        nodes.iExcluir = this.createElements({
            element: 'i',
            classNames: ['fa-solid', 'fa-x'],
        });

        nodes.btnEditar = this.createElements({
            element: 'button',
            classNames: completeTaskClass,
        });

        nodes.iEditar = this.createElements({
            element: 'i',
            classNames: ['fa-solid', 'fa-pen-to-square'],
        });

        nodes.idTask = idTask;
        nodes.completeTask = completeTask;
        nodes.color  = colorNumberSave;

        return nodes;
    }


    this.clearFocus = function(el) {
        el.value = '';
        el.focus();
    }


    this.addTask = function(title) {
        const tasksCreate = this.createTask(title);
        const { idTask, completeTask, color } = tasksCreate;
        this.renderTask(tasksCreate);

        this.saveTaskStorage(title, idTask, completeTask, color);
        this.updateTaskCount();
    }

    this.renderTask = function(object) {
        if (object) {
            const listTask = document.getElementById('container-tarefas');
            const { li, label, checkbox, span, divTitle, pTitle, divButtons,
                btnExcluir, iExcluir, btnEditar, iEditar } = object;

            divTitle.append(pTitle);
            label.append(checkbox, span, divTitle);

            btnExcluir.append(iExcluir);
            btnEditar.append(iEditar);
            divButtons.append(btnEditar, btnExcluir);

            li.append(label, divButtons);
            listTask.append(li);
        }
    }


    this.removeTask = function(element, elementFather) {
        const fatherElement = element.closest(elementFather);

        if (!fatherElement) return;

        const dataId = fatherElement.dataset.id;

        if (dataId) {
            this.deleteTaskStorage(dataId);
        }

        fatherElement.remove();
        this.updateTaskCount();
    }


    this.getStorageTasks = function() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }


    this.saveLocalStorage = function() {
        localStorage.setItem('tasks', JSON.stringify(storageListTask));
    }


    this.saveTaskStorage = function(titleTask, idTask, completeTask, colorTask) {
        const newTask = {
            title: titleTask,
            id: idTask,
            complete: completeTask !== null ? completeTask : false,
            colorTask: colorTask !== null ? colorTask : 0
        };
        storageListTask.push(newTask);
        this.saveLocalStorage();

        this.updateTaskCount();
    }



    this.deleteTaskStorage = function(idTask) {
        storageListTask = storageListTask.filter(task => task.id !== idTask);
        this.saveLocalStorage();
    }


    this.toggleTaskCompleteStorage = function(idTask) {
        const task = storageListTask.find(t => t.id === idTask);
        if (task) {
            task.complete = !task.complete;
            this.saveLocalStorage();
        }
    }


    this.selectionRange = function(el) {
        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(el);
        range.collapse(false);

        selection.removeAllRanges();
        selection.addRange(range);
    }


    this.editTask = function(el) {
        const father = el.closest(".tarefas");
        const titleEdit = father.querySelector('.task-title')

        titleEdit.contentEditable = true;
        titleEdit.focus()

        this.selectionRange(titleEdit);
    }

    this.editTaskTitle = function(idTask, newTitle) {
        const task = storageListTask.find(t => t.id === idTask);
        if (task) {
            task.title = newTitle;
            this.saveLocalStorage();
        }
    }

    this.editColorCheckbox = function(classColorList) {
        const lastElementClick = lastCheckboxclicked.taskInfo;

        lastElementClick.element.className = classColorList.value;

        const task = storageListTask.find(t => t.id === lastElementClick.id);
        const colorIndice = colors.indexOf(classColorList[1]);

        if (task && colorIndice !== -1) {
            task.colorTask = colorIndice;
            this.saveLocalStorage();
        }

        const window = this.returnElement('.janela-muda-cor')
        if (window) window.remove();
    }


    this.completeTask = function(el) {
        const father = el.closest(".tarefas");
        const buttonBlock = father.querySelector('.btn-editar');
        const dataId = father.getAttribute('data-id');

        if (buttonBlock) {
            buttonBlock.classList.toggle('button-block');
            this.toggleTaskCompleteStorage(dataId);
        }
        this.updateTaskCount();
    }


    this.updateTaskCount = function() {
        const completedCount = storageListTask.reduce((acc, task) => task.complete ? acc + 1 : acc, 0);

        if (elementCompleted) elementCompleted.textContent = String(completedCount);
        if (elementTotal) elementTotal.textContent = String(storageListTask.length);
    }


    this.eventsClick = function(e) {
        const el = e.target;
        const windowCor = this.returnElement('.janela-muda-cor');

        if (el.classList.contains('btn-add-tarefa')) {
            e.preventDefault();
            const inputTask = document.getElementById("input-tarefa");
            const inputValue = inputTask.value.trim();

            if (inputValue === "") return;

            this.addTask(inputValue);
            this.clearFocus(inputTask);
        }

        if (el.closest('.btn-editar')) {
            this.editTask(el);
        }

        if (el.closest('.btn-excluir')) {
            this.removeTask(el, 'li');
        }

        if (el.closest('input[type="checkbox"]')) {
            this.completeTask(el);
        }

        if (windowCor && !windowCor.contains(el)) {
            windowCor.remove();
        }

        if (windowCor && el.classList.contains('checkbox')) {
            const elementClass = el.classList
            this.editColorCheckbox(elementClass);
        }
    }


    this.eventsKeys = function(e) {
        const el = e.target;

        if (e.key === 'Enter' && el.id === 'input-tarefa') {
            e.preventDefault();

            const inputValue = el.value.trim();

            if (!inputValue) return;

            this.addTask(inputValue);
            this.clearFocus(el);
        }

        if (e.key === 'Enter' && el.classList.contains('task-title')) {
            e.preventDefault();

            const father = el.closest('.tarefas');
            const idTask = father.dataset.id;
            const newTitle = el.innerText.trim();

            el.contentEditable = false;

            this.editTaskTitle(idTask, newTitle);
            el.blur();
        }
    }


    this.eventsClickMenu = function(e) {
        const el = e.target;
        e.preventDefault();
        console.log(el)

        if (el.classList.contains('checkbox')) {
            const elementFather = el.closest('.tarefas');
            const idTask = elementFather.dataset.id;
            lastCheckboxclicked.taskInfo = { id: idTask, element: el };

            const rect = el.getBoundingClientRect();
            this.windowColor(rect);
        }
    }


    this.returnElement = function(el) {
        return document.querySelector(el);
    }


    this.loadTaskStorage = function() {
        let isColorApplied = false

        for (const task of storageListTask) {
            if (!isColorApplied) {
                currentNumberColor = task.colorTask;
                isColorApplied = true;
            }

            const tasksCreate = this.createTask(task.title, task.id, task.complete, task.colorTask);
            this.renderTask(tasksCreate);
        }

        this.updateTaskCount();
    }


    this.createWindowColor = function() {
        const nodes = {}

        nodes.div = this.createElements({
            element: 'div',
            classNames: ['janela-muda-cor'],
        });

        nodes.h2 = this.createElements({
            element: 'h2',
            text: 'Cores'
        });

        nodes.div2 = this.createElements({
            element: 'div',
            attributes: {
                className: 'janela-container'
            }
        });

        for (const cor of colors) {
            nodes[`span_${cor}`] = this.createElements({
                element: 'span',
                classNames: ['checkbox',cor],
            });
        }

        return nodes;
    }

    this.renderWindowColor = function(rect, object) {
        const { div, h2, div2, ...rest } = object;
        const elements = Object.values(rest);

        div.appendChild(h2);
        div.appendChild(div2);

        for (const el of elements) {
            div2.appendChild(el);
        }

        document.body.appendChild(div);

        div.style.top = `${rect.top}px`;
        div.style.left = `${rect.left + 20}px`;

    }

    this.windowColor = function(rect) {
        const window = document.querySelector('.janela-muda-cor');

        if (window) window.remove();

        const nodes = this.createWindowColor();
        this.renderWindowColor(rect, nodes);
    }

    this.init = function() {
        document.addEventListener('click', (e) => this.eventsClick(e));
        document.addEventListener('keydown', (e) => this.eventsKeys(e));
        document.addEventListener('contextmenu', (e) => this.eventsClickMenu(e));
        this.loadTaskStorage();
    }

    const colors = ['cor-orange', 'cor-purple', 'cor-cyan', 'cor-green', 'cor-pink', 'cor-red', 'cor-yellow', 'cor-blue', 'cor-black'];
    const elementTotal = document.getElementById('tarefas-total');
    const elementCompleted = document.getElementById('tarefas-concluidas');
    let storageListTask = this.getStorageTasks();
    let currentNumberColor = 0;
    const lastCheckboxclicked = {};
}

const listApp = new ListApp();
listApp.init();