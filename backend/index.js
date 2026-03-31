require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "tarefas.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

let tarefas = [];

function carregarTarefas() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const dados = fs.readFileSync(DATA_FILE, "utf8");
      tarefas = JSON.parse(dados) || [];
    } else {
      tarefas = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify(tarefas, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    tarefas = [];
  }
}

function salvarTarefas() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tarefas, null, 2), "utf8");
  } catch (error) {
    console.error("Erro ao salvar tarefas:", error);
  }
}

carregarTarefas();

// LISTAR TAREFAS
app.get("/tarefas", (req, res) => {
  res.json(tarefas);
});

// CRIAR TAREFA
app.post("/tarefas", (req, res) => {
  const novaTarefa = req.body;

  if (!novaTarefa.titulo || !novaTarefa.data || !novaTarefa.hora) {
    return res.status(400).json({ mensagem: "Dados da tarefa incompletos." });
  }

  tarefas.push(novaTarefa);
  salvarTarefas();

  res.json({
    mensagem: "Tarefa criada com sucesso!",
    tarefa: novaTarefa
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
