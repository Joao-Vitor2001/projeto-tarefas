const form = document.getElementById("form-financa");
const tipoToggle = document.getElementById("tipo-toggle");
const tabelaFinancas = document.getElementById("tabela-financas");
const listaVencimentos = document.getElementById("lista-vencimentos");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");
const exportarBtn = document.getElementById("exportar");
const totalReceitas = document.getElementById("total-receitas");
const totalDespesas = document.getElementById("total-despesas");
const totalSaldo = document.getElementById("total-saldo");
const totalVencimentos = document.getElementById("total-vencimentos");

let tipoSelecionado = "Despesa";
const registros = [];

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function calcularStatus(vencimento) {
    const hoje = new Date();
    const dataVencimento = new Date(vencimento + "T23:59:59");
    return dataVencimento <= hoje ? "Recebido" : "Pendente";
}

function atualizarResumo() {
    const receitas = registros
        .filter(item => item.tipo === "Receita")
        .reduce((sum, item) => sum + item.valor, 0);
    const despesas = registros
        .filter(item => item.tipo === "Despesa")
        .reduce((sum, item) => sum + item.valor, 0);

    const vencimentos = registros.filter(item => {
        const hoje = new Date();
        const data = new Date(item.vencimento + "T23:59:59");
        const diff = (data - hoje) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;

    totalReceitas.textContent = formatarMoeda(receitas);
    totalDespesas.textContent = formatarMoeda(despesas);
    totalSaldo.textContent = formatarMoeda(receitas - despesas);
    totalVencimentos.textContent = vencimentos;
}

function renderizarTabela() {
    const tipo = filtroTipo.value;
    const categoria = filtroCategoria.value;
    const itensFiltrados = registros.filter(item => {
        const tipoOk = tipo === "todos" || item.tipo === tipo;
        const categoriaOk = categoria === "todos" || item.categoria === categoria;
        return tipoOk && categoriaOk;
    });

    if (!itensFiltrados.length) {
        tabelaFinancas.innerHTML = "<tr><td colspan=\"7\" class=\"empty-row\">Nenhuma finança cadastrada ainda.</td></tr>";
        return;
    }

    tabelaFinancas.innerHTML = itensFiltrados.map(item => {
        const status = calcularStatus(item.vencimento);
        return `
            <tr>
                <td>${item.titulo}</td>
                <td>${item.categoria}</td>
                <td>${item.tipo}</td>
                <td>R$ ${formatarMoeda(item.valor)}</td>
                <td>${item.vencimento.split("-").reverse().join("/")}</td>
                <td>${item.parcelas}x</td>
                <td><span class="status-badge ${status === "Recebido" ? "recebido" : "pendente"}">${status}</span></td>
            </tr>
        `;
    }).join("");
}

function renderizarVencimentos() {
    const proximos = registros
        .slice()
        .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))
        .slice(0, 3);

    if (!proximos.length) {
        listaVencimentos.innerHTML = "<p>Nenhum vencimento cadastrado.</p>";
        return;
    }

    listaVencimentos.innerHTML = proximos.map(item => {
        const hoje = new Date();
        const data = new Date(item.vencimento + "T23:59:59");
        const diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
        const quando = diff === 0 ? "Vence hoje" : `Vence em ${diff} dia${Math.abs(diff) === 1 ? "" : "s"}`;
        return `
            <div class="due-card">
                <div class="due-card__info">
                    <p class="due-card__title">${item.titulo}</p>
                    <p class="due-card__meta">${item.categoria}</p>
                </div>
                <div class="due-card__details">
                    <span class="due-card__amount">R$ ${formatarMoeda(item.valor)}</span>
                    <span class="due-card__when">${quando}</span>
                </div>
            </div>
        `;
    }).join("");
}

function atualizarDashboard() {
    atualizarResumo();
    renderizarTabela();
    renderizarVencimentos();
}

tipoToggle.addEventListener("click", event => {
    const button = event.target.closest(".type-button");
    if (!button) return;

    document.querySelectorAll(".type-button").forEach(el => el.classList.remove("active"));
    button.classList.add("active");
    tipoSelecionado = button.dataset.value;
});

form.addEventListener("submit", event => {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const valor = parseFloat(document.getElementById("valor").value.replace(",", ".")) || 0;
    const vencimento = document.getElementById("vencimento").value;
    const parcelas = document.getElementById("parcelas").value;
    const categoria = document.getElementById("categoria").value;

    if (!titulo || !valor || !vencimento) {
        return;
    }

    registros.unshift({
        titulo,
        valor,
        vencimento,
        parcelas,
        categoria,
        tipo: tipoSelecionado,
    });

    form.reset();
    document.querySelector(".type-button[data-value=\"Despesa\"]").classList.add("active");
    document.querySelector(".type-button[data-value=\"Receita\"]").classList.remove("active");
    tipoSelecionado = "Despesa";

    atualizarDashboard();
});

filtroTipo.addEventListener("change", renderizarTabela);
filtroCategoria.addEventListener("change", renderizarTabela);

exportarBtn.addEventListener("click", () => {
    const csv = [
        ["Título", "Categoria", "Tipo", "Valor", "Vencimento", "Parcelas", "Status"],
        ...registros.map(item => [
            item.titulo,
            item.categoria,
            item.tipo,
            `R$ ${formatarMoeda(item.valor)}`,
            item.vencimento.split("-").reverse().join("/"),
            item.parcelas,
            calcularStatus(item.vencimento),
        ])
    ].map(row => row.join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "financas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

atualizarDashboard();
