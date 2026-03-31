// script.js = ações da tela

const API_URL = "http://localhost:3000";

const formTarefa = document.getElementById("form-tarefa");
const inputTitulo = document.getElementById("titulo");
const inputData = document.getElementById("data");
const inputHora = document.getElementById("hora");
const listaTarefas = document.getElementById("lista-tarefas");

async function carregarTarefas() {
    try {
        const resposta = await fetch(`${API_URL}/tarefas`);
        const tarefas = await resposta.json();

        listaTarefas.innerHTML = "";

        if (!tarefas.length) {
            listaTarefas.innerHTML = "<p>Nenhuma tarefa cadastrada ainda.</p>";
            return;
        }

        tarefas.forEach((tarefa) => {
            const div = document.createElement("div");
            div.className = "tarefa";

            div.innerHTML = `
        <h3>${tarefa.titulo}</h3>
        <p><strong>Data:</strong> ${tarefa.data}</p>
        <p><strong>Hora:</strong> ${tarefa.hora}</p>
      `;

            listaTarefas.appendChild(div);
        });
    } catch (erro) {
        console.error("Erro ao carregar tarefas:", erro);
        listaTarefas.innerHTML = "<p>Erro ao carregar tarefas.</p>";
    }
}

formTarefa.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novaTarefa = {
        titulo: inputTitulo.value,
        data: inputData.value,
        hora: inputHora.value,
    };

    try {
        const resposta = await fetch(`${API_URL}/tarefas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(novaTarefa),
        });

        if (!resposta.ok) {
            throw new Error("Erro ao salvar tarefa");
        }

        formTarefa.reset();
        carregarTarefas();
    } catch (erro) {
        console.error("Erro ao criar tarefa:", erro);
        alert("Não foi possível salvar a tarefa.");
    }
});

carregarTarefas();