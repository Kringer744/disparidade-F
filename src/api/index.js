const BASE = import.meta.env.VITE_API_URL || "/api";

async function req(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(BASE + path, opts);
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(err.detail || "Erro na requisição");
  }
  return r.json();
}

// Clientes
export const getClientes = () => req("GET", "/clientes/");
export const createCliente = (data) => req("POST", "/clientes/", data);
export const updateCliente = (id, data) => req("PATCH", `/clientes/${id}`, data);
export const deleteCliente = (id) => req("DELETE", `/clientes/${id}`);

// Busca
export const buscarHotel = (data) => req("POST", "/buscar/", data);
export const buscarTodosClientes = () => req("POST", "/buscar/todos-clientes");

// Disparidades
export const getDashboard = () => req("GET", "/disparidades/dashboard");
export const getHistorico = (id) => req("GET", `/disparidades/historico/${id}`);
export const getPrecosBusca = (buscaId) => req("GET", `/disparidades/precos/${buscaId}`);
export const getComparacao = (buscaId) => req("GET", `/disparidades/comparacao/${buscaId}`);
export const getBuscasRecentes = (limit = 20) => req("GET", `/disparidades/recentes?limit=${limit}`);

// Relatórios
export const gerarRelatorio = (data) => req("POST", "/relatorios/gerar", data);
export const getRelatorios = () => req("GET", "/relatorios/");
export const downloadRelatorio = (filename) =>
  window.open(`${BASE}/relatorios/download/${filename}`, "_blank");

// IA
export const analisarComIA = (buscaId, hotelName) =>
  req("POST", "/ai/analisar", { busca_id: buscaId, hotel_name: hotelName });

export const buscarAnalisarIA = (data) =>
  req("POST", "/ai/buscar-analisar", data);

export const gerarRelatorioIA = (data) =>
  req("POST", "/ai/relatorio-pdf", data);

export const getHistoricoIA = (limit = 50) =>
  req("GET", `/ai/historico?limit=${limit}`);

export const getAnaliseIA = (id) =>
  req("GET", `/ai/historico/${id}`);

export const getTokenStats = () =>
  req("GET", "/ai/tokens");
