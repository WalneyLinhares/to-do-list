// ======= ELEMENTOS =======
const container = document.getElementById("container-tarefas");
const input = document.getElementById("input-tarefa");
const btnAdd = document.getElementById("btn-add");
const tarefasTotal = document.getElementById('tarefas-total')
const tarefasConcluidas = document.getElementById('tarefas-concluidas')

// ======= DADOS =======
let tarefas = [];
let corAtual = 0;

// ATUALIZAR CONTADOR DAS TAREFAS
function atualizarContador() {
    tarefasTotal.textContent = tarefas.length;
    tarefasConcluidas.textContent = tarefas.reduce((cont, t) => t.completa ? cont + 1 : cont, 0);
}

// ======= LOCAL STORAGE =======
function salvarLocalStorage() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    atualizarContador();
}

function carregarLocalStorage() {
    tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');
    tarefas.forEach(tarefa => criarTarefaDOM(tarefa));
    atualizarContador();
}

// ======= CORES =======
function pegarProximaCor() {
    const listCores = ['#FFA500', '#836FFF', '#00BFFF', '#00FA9A', '#FF69B4', '#FF0000', '#FFFF00'];
    const cor = listCores[corAtual];
    corAtual = (corAtual + 1) % listCores.length;
    return cor;
}

// ======= CRIAR TAREFA =======
function adicionarTarefa(titulo) {
    const id = Math.random().toString(36).substring(2, 9);
    const tarefa = { id, titulo, cor: pegarProximaCor(), completa: false };
    tarefas.push(tarefa);
    salvarLocalStorage();
    criarTarefaDOM(tarefa);
}

function criarTarefaDOM(tarefa) {
    const divTarefa = document.createElement('div');
    divTarefa.classList.add('tarefas');
    divTarefa.dataset.id = tarefa.id;

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarefa.completa;

    const span = document.createElement('span');
    span.classList.add('checkbox');
    span.style.setProperty('--checkbox-color', tarefa.cor);

    const p = document.createElement('p');
    p.innerHTML = `<span>${tarefa.titulo}</span>`;

    const divButton = document.createElement('div');
    divButton.classList.add('buttons');

    const btnExcluir = document.createElement('button');
    btnExcluir.classList.add('btn-excluir');
    btnExcluir.innerHTML = '<i class="fa-solid fa-x"></i>';

    const btnEditar = document.createElement('button');
    btnEditar.classList.add('btn-editar');
    btnEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';

    label.append(checkbox, span, p);
    divButton.append(btnExcluir, btnEditar);
    divTarefa.append(label, divButton);
    container.appendChild(divTarefa);
}

// ======= EVENTOS =======

// ADICIONAR
const adicionar = (event) => {
    if (event.type === 'click' || event.key === 'Enter') {
        if (event.key === 'Enter') event.preventDefault();
        const titulo = input.value.trim();
        if (titulo && titulo.length < 100) {
            adicionarTarefa(titulo);
            input.value = '';
        }
    }
    
}
btnAdd.addEventListener('click', adicionar)
input.addEventListener('keydown', adicionar)


container.addEventListener('click', (e) => {
    const tarefaDiv = e.target.closest('.tarefas');
    if (!tarefaDiv) return;
    const id = tarefaDiv.dataset.id;
    const tarefa = tarefas.find(t => t.id === id);

    // EXCLUIR
    if (e.target.closest('.btn-excluir')) {
        tarefaDiv.remove();
        tarefas = tarefas.filter(t => t.id !== id);
        salvarLocalStorage();
    }

    // EDITAR
    if (e.target.closest('.btn-editar')) {
        const spanTitulo = tarefaDiv.querySelector('p > span');
        spanTitulo.contentEditable = true;
        spanTitulo.focus();

        const finalizarEdicao = (event) => {
            if (event.type === 'blur' || event.key === 'Enter') {
                if (event.key === 'Enter') event.preventDefault();
                spanTitulo.contentEditable = false;
                spanTitulo.removeEventListener('keydown', finalizarEdicao);
                spanTitulo.removeEventListener('blur', finalizarEdicao);

                tarefa.titulo = spanTitulo.textContent.trim();
                salvarLocalStorage();
            }
        };

        spanTitulo.addEventListener('keydown', finalizarEdicao);
        spanTitulo.addEventListener('blur', finalizarEdicao);
    }

    // MARCAR DESMARCAR CHECKBOX
    if (e.target.closest('input[type="checkbox"]')) {
        tarefa.completa = e.target.checked;
        salvarLocalStorage();
    }
});

// ======= CARREGAMENTO =======
document.addEventListener('DOMContentLoaded', carregarLocalStorage);