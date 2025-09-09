const container = document.getElementById("container-tarefas");
const input = document.getElementById("input-tarefa");
const btnAdd = document.getElementById("btn-add");

function criarTarefa(titulo) {
    const divTarefa = document.createElement('div');
    divTarefa.classList.add('tarefas');

    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    const span = document.createElement('span');
    span.classList.add('checkbox');
    span.style.setProperty('--checkbox-color', 'red');
    const p = document.createElement('p');
    p.innerHTML = `<span>${titulo}</span>`;

    const divButton = document.createElement('div');
    divButton.classList.add('buttons')
    const btnExcluir = document.createElement('button')
    btnExcluir.classList.add('btn-excluir')
    btnExcluir.innerHTML = '<i class="fa-solid fa-x"></i>'
    const btnEditar = document.createElement('button')
    btnEditar.classList.add('btn-editar')
    btnEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>'

    label.append(input, span, p);
    divButton.append(btnExcluir, btnEditar)
    divTarefa.append(label, divButton)

    container.appendChild(divTarefa);
}

btnAdd.addEventListener("click", () => {
    const tarefa = input.value
    
    if (tarefa.length > 0) {
        criarTarefa(tarefa);
        input.value = "";
    }
})

container.addEventListener('click', (e) => {
    if (e.target.closest(".btn-excluir")) {
        const tarefa = e.target.closest(".tarefas");
        console.log(tarefa)
        if (tarefa) tarefa.remove();
    }
})