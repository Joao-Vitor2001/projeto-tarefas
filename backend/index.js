require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ROTA DE TAREFAS
let tarefas = [];

// ROTA TESTE
app.get("/", (req, res) => {
  res.send("api rodando");
});

// LISTAR TAREFAS
app.get("/tarefas", (req, res) => {
  res.json(tarefas);
});

// CRIAR TAREFA
app.post("/tarefas", (req, res) => {
  const novaTarefa = req.body;

  tarefas.push(novaTarefa);

  res.json({
    mensagem: "Tarefa criada com sucesso!",
    tarefa: novaTarefa
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});