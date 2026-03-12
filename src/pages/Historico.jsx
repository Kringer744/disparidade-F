import { useEffect, useState } from "react";
import {
  getBuscasRecentes, getComparacao, gerarRelatorio, downloadRelatorio,
  getHistoricoIA, getAnaliseIA, gerarRelatorioIA, getTokenStats,
} from "../api";
import {
  AlertTriangle, CheckCircle, HelpCircle, X, TrendingDown, TrendingUp,
  ExternalLink, Clock, FileText, Sparkles, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import AIAnalysis from "../components/AIAnalysis";
import ReactMarkdown from "react-markdown";

const fmt = (v) =>
  v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "—";

const fmtDate = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const STATUS = {
  disparidade: { label: "Disparidade", bg: "bg-orange-500/10 text-orange-500 border border-orange-500/20", icon: AlertTriangle },
  ok:          { label: "OK",          bg: "bg-brand-500/10 text-brand-500 border border-brand-500/20",   icon: CheckCircle  },
  sem_dados:   { label: "Sem dados",   bg: "bg-white/5 text-white/40 border border-white/10",             icon: HelpCircle   },
};

/* ── Modal detalhe busca de preços ── */
function DetailModal({ busca, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComparacao(busca.busca_id).then(setData).finally(() => setLoading(false));
  }, [busca]);

  const baratas = data?.otas_mais_baratas ?? [];
  const caras   = data?.otas_mais_caras   ?? [];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-dark-card border border-dark-border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-dark-border shrink-0 bg-gradient-to-r from-transparent to-brand-500/5">
          <div>
            <h2 className="font-black text-xl text-white tracking-tight">{busca.nome}</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              {busca.check_in} → {busca.check_out} | {fmtDate(busca.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="text-center text-white/20 py-12 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando comparação...</div>
          ) : !data || (!baratas.length && !caras.length) ? (
            <div className="text-center text-white/20 py-12 font-bold uppercase tracking-widest text-xs">Sem dados de comparação.</div>
          ) : (
            <>
              <AIAnalysis
                buscaId={busca.busca_id}
                hotelName={busca.nome}
                checkIn={busca.check_in}
                checkOut={busca.check_out}
              />
              
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl px-6 py-5 flex items-center justify-between group">
                <div>
                  <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">
                    Preço Oficial Detectado
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">
                    {fmt(data.preco_direto)}
                  </div>
                </div>
                <CheckCircle size={36} className="text-brand-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-2xl p-5 transition-all ${baratas.length > 0 ? "bg-orange-500/5 border border-orange-500/20" : "bg-white/5 border border-white/5"}`}>
                  <div className={`text-4xl font-black ${baratas.length > 0 ? "text-orange-500" : "text-white/20"}`}>{baratas.length}</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">
                    <TrendingDown size={14} strokeWidth={3} /> OTAs BARATAS
                  </div>
                </div>
                <div className={`rounded-2xl p-5 transition-all ${caras.length > 0 ? "bg-brand-500/5 border border-brand-500/20" : "bg-white/5 border border-white/5"}`}>
                  <div className={`text-4xl font-black ${caras.length > 0 ? "text-brand-500" : "text-white/20"}`}>{caras.length}</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">
                    <TrendingUp size={14} strokeWidth={3} /> OTAs CARAS
                  </div>
                </div>
              </div>

              {baratas.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TrendingDown size={14} strokeWidth={3} /> OTAs mais baratas que o oficial
                  </h3>
                  <div className="space-y-2">
                    {baratas.map((o, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 hover:border-orange-500/30 rounded-xl px-5 py-4 transition-all group">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">{o.ota_nome}</div>
                          <div className="text-[10px] text-orange-500/60 font-black uppercase tracking-widest mt-1">
                            {fmt(o.diferenca_valor)} abaixo ({o.diferenca_pct?.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 shrink-0">
                          <span className="font-black text-white text-lg">{fmt(o.preco_total)}</span>
                          {o.link && (
                            <a href={o.link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-orange-500 transition-all">
                              <ExternalLink size={14} strokeWidth={3} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {caras.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TrendingUp size={14} strokeWidth={3} /> OTAs mais caras que o oficial
                  </h3>
                  <div className="space-y-2">
                    {caras.map((o, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 hover:border-brand-500/30 rounded-xl px-5 py-4 transition-all group">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-white group-hover:text-brand-500 transition-colors uppercase tracking-tight">{o.ota_nome}</div>
                          <div className="text-[10px] text-brand-500/60 font-black uppercase tracking-widest mt-1">
                            {fmt(Math.abs(o.diferenca_valor))} acima ({Math.abs(o.diferenca_pct)?.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 shrink-0">
                          <span className="font-black text-white text-lg">{fmt(o.preco_total)}</span>
                          {o.link && (
                            <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-500">
                              <ExternalLink size={14} strokeWidth={3} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Modal detalhe análise IA ── */
function AIDetailModal({ entry, onClose }) {
  const [fullAnalise, setFullAnalise] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [pdfLoading, setPdfLoading]   = useState(false);

  useEffect(() => {
    getAnaliseIA(entry.id)
      .then((r) => setFullAnalise(r.analise))
      .catch(() => setFullAnalise(entry.analise_preview))
      .finally(() => setLoading(false));
  }, [entry]);

  const handleDownloadPdf = async () => {
    if (!fullAnalise) return;
    setPdfLoading(true);
    try {
      const r = await gerarRelatorioIA({
        hotel_name: entry.hotel_name,
        analise: fullAnalise,
        check_in: entry.check_in,
        check_out: entry.check_out,
      });
      downloadRelatorio(r.filename);
    } catch (e) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const tipoLabel = entry.tipo === "busca_ia" ? "Busca com IA" : "Análise de Busca";

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-dark-card border border-dark-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-dark-border shrink-0 bg-gradient-to-r from-transparent to-brand-500/5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Sparkles size={20} className="text-brand-500" strokeWidth={3} />
              <h2 className="font-black text-xl text-white tracking-tight">{entry.hotel_name}</h2>
              <span className="text-[10px] bg-brand-500/10 text-brand-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-brand-500/20">
                {tipoLabel}
              </span>
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {entry.check_in} → {entry.check_out} | {entry.adultos} adultos | {fmtDate(entry.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all border border-white/5"
            >
              {pdfLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <FileText size={14} strokeWidth={3} />
              )}
              {pdfLoading ? "Gerando..." : "Download PDF"}
            </button>
            <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center gap-3 text-brand-500 font-black uppercase tracking-widest text-xs py-12 justify-center animate-pulse">
              <Sparkles size={18} className="animate-spin" />
              Carregando análise...
            </div>
          ) : (
            <div className="text-white/70 text-sm leading-relaxed font-medium">
              <ReactMarkdown
                components={{
                  strong: ({node, ...props}) => <span className="font-black text-white" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-xl font-black text-white mt-8 mb-4 uppercase tracking-tight" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-black text-white mt-6 mb-3 uppercase tracking-tight" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="space-y-2 mb-4 ml-4" {...props} />,
                  li: ({node, ...props}) => <li className="list-disc pl-2" {...props} />,
                }}
              >
                {fullAnalise || entry.analise_preview}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Histórico de Preços ── */
function TabPrecos() {
  const [buscas,     setBuscas]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [limit,      setLimit]      = useState(20);
  const [selected,   setSelected]   = useState(null);
  const [pdfLoading, setPdfLoading] = useState(null);

  const handleGerarPdf = async (b) => {
    setPdfLoading(b.busca_id);
    try {
      const r = await gerarRelatorio({
        periodo_inicio: b.check_in,
        periodo_fim: b.check_out,
        cliente_id: b.cliente_id || null,
      });
      downloadRelatorio(r.filename);
    } catch (e) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setPdfLoading(null);
    }
  };

  const load = async (lim = limit) => {
    setLoading(true);
    try { setBuscas(await getBuscasRecentes(lim)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (buscas.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-3xl p-20 text-center shadow-sm">
        <Clock size={48} className="mx-auto mb-4 text-white/5" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhuma busca realizada ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); load(Number(e.target.value)); }}
          className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/60 focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer hover:border-brand-500/50"
        >
          <option value={20} className="bg-dark-card">Últimas 20</option>
          <option value={50} className="bg-dark-card">Últimas 50</option>
          <option value={100} className="bg-dark-card">Últimas 100</option>
        </select>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-dark-border">
                <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Hotel</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Período</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Preço Oficial</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Menor OTA</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Realizada em</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Relatório</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {buscas.map((b, i) => {
                const cfg  = STATUS[b.status] || STATUS.sem_dados;
                const Icon = cfg.icon;
                return (
                  <tr
                    key={b.busca_id}
                    onClick={() => b.preco_direto && setSelected(b)}
                    className={`group hover:bg-white/[0.03] transition-colors ${b.preco_direto ? "cursor-pointer" : ""}`}
                  >
                    <td className="px-6 py-5">
                      <div className="font-black text-white tracking-tight uppercase group-hover:text-brand-500 transition-colors uppercase">{b.nome}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                        {b.check_in} — {b.check_out}
                      </div>
                      {b.adultos && <div className="text-[9px] font-black text-brand-500/60 uppercase tracking-tighter">{b.adultos} ADULTOS</div>}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-white text-base tracking-tighter">{fmt(b.preco_direto)}</td>
                    <td className="px-6 py-5 text-right">
                      {b.menor_preco_ota ? (
                        <div>
                          <div className={`font-black tracking-tighter text-base ${b.status === "disparidade" ? "text-orange-500" : "text-brand-500"}`}>
                            {fmt(b.menor_preco_ota)}
                          </div>
                          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest truncate">{b.ota_mais_barata}</div>
                        </div>
                      ) : <span className="text-white/10">—</span>}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${cfg.bg}`}>
                        <Icon size={12} strokeWidth={3} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">
                      {fmtDate(b.created_at)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGerarPdf(b); }}
                        disabled={pdfLoading === b.busca_id}
                        className="p-2.5 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
                      >
                        {pdfLoading === b.busca_id
                          ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          : <FileText size={18} strokeWidth={2} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <DetailModal busca={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

/* ── Painel de estatísticas de tokens ── */
function TokenStatsPanel() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(true);

  useEffect(() => {
    getTokenStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  const fmtNum = (n) => n?.toLocaleString("pt-BR") ?? "0";
  const fmtUsd = (n) => `US$ ${(n ?? 0).toFixed(4)}`;
  const fmtBrl = (n) => `R$ ${(n ?? 0).toFixed(4)}`;

  return (
    <div className="bg-dark-card border border-dark-border rounded-3xl mb-8 overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
      
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-8 py-6 text-left group transition-all hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/20 group-hover:scale-110 transition-transform">
            <Sparkles size={20} strokeWidth={3} />
          </div>
          <div>
            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest block mb-0.5">Monitoramento de IA</span>
            <span className="text-xl font-black text-white tracking-tight">Estatísticas de Consumo</span>
          </div>
          <span className="text-[9px] bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-brand-500/20 ml-2">
            {fmtNum(stats.total_analises)} análises
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Total Utilizado</div>
            <div className="text-sm font-black text-white">{fmtNum(stats.total_tokens)} tokens</div>
          </div>
          {open ? <ChevronUp size={20} className="text-white/20" /> : <ChevronDown size={20} className="text-white/20" />}
        </div>
      </button>

      {open && (
        <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-brand-500/30 transition-all">
              <div className="text-2xl font-black text-white tracking-tighter mb-1">{fmtNum(stats.total_input_tokens)}</div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tokens Entrada</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-brand-500/30 transition-all">
              <div className="text-2xl font-black text-white tracking-tighter mb-1">{fmtNum(stats.total_output_tokens)}</div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tokens Saída</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-brand-500/30 transition-all">
              <div className="text-2xl font-black text-white tracking-tighter mb-1">{fmtUsd(stats.custo_total_usd)}</div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Custo (USD)</div>
            </div>
            <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-5 hover:border-brand-500/30 transition-all">
              <div className="text-2xl font-black text-brand-500 tracking-tighter mb-1">{fmtBrl(stats.custo_total_brl)}</div>
              <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Estimativa Real</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[9px] text-white/40 bg-white/5 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/5">
              Modelo: <span className="text-white ml-1">{stats.modelo}</span>
            </span>
            <span className="text-[9px] text-brand-500 bg-brand-500/5 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-brand-500/10">
              Buscas IA: <span className="text-white ml-1">{stats.por_tipo?.busca_ia ?? 0}</span>
            </span>
            <span className="text-[9px] text-orange-500 bg-orange-500/5 px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-orange-500/10">
              Análises: <span className="text-white ml-1">{stats.por_tipo?.analise_busca ?? 0}</span>
            </span>
            <span className="text-[9px] text-white/10 ml-auto font-black uppercase tracking-widest">
              $0,15/1M Entrada · $0,60/1M Saída
            </span>
          </div>

          {stats.ultimos_7_dias?.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Atividade de Tokens nos Últimos 7 Dias</div>
              <div className="grid grid-cols-7 gap-4">
                {stats.ultimos_7_dias.map((d) => {
                  const maxTokens = Math.max(...stats.ultimos_7_dias.map((x) => x.tokens), 1);
                  const pct = Math.round((d.tokens / maxTokens) * 100);
                  return (
                    <div key={d.data} className="text-center group" title={`${d.data}: ${d.analises} análises, ${d.tokens} tokens`}>
                      <div className="h-20 flex items-end justify-center mb-3">
                        <div
                          className={`w-full max-w-[32px] rounded-lg transition-all duration-500 group-hover:brightness-125 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] ${d.tokens > 0 ? "bg-gradient-to-t from-brand-700 to-brand-500" : "bg-white/5"}`}
                          style={{ height: `${Math.max(pct, d.tokens > 0 ? 10 : 4)}%` }}
                        />
                      </div>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-tighter group-hover:text-white/40 transition-colors uppercase">{d.data.slice(5)}</div>
                      {d.analises > 0 && (
                        <div className="text-[10px] font-black text-brand-500 mt-1">{d.analises}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tab: Histórico de Análises IA ── */
function TabIA() {
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [limit,    setLimit]    = useState(50);

  const load = async (lim = limit) => {
    setLoading(true);
    try { setEntries(await getHistoricoIA(lim)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      );
    }
    if (entries.length === 0) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-20 text-center shadow-sm">
          <Sparkles size={48} className="mx-auto mb-4 text-white/5" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhuma análise com IA ainda.</p>
          <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-2">Use "Busca IA" para gerar relatórios inteligentes.</p>
        </div>
      );
    }
    return (
      <>
        <div className="flex justify-end mb-6">
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); load(Number(e.target.value)); }}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/60 focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer hover:border-brand-500/50"
          >
            <option value={20} className="bg-dark-card">Últimas 20</option>
            <option value={50} className="bg-dark-card">Últimas 50</option>
            <option value={100} className="bg-dark-card">Últimas 100</option>
          </select>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-dark-border">
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Hotel</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Período</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Prévia da Análise</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Tokens</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {entries.map((e, i) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Sparkles size={14} className="text-brand-500" strokeWidth={3} />
                        <div className="font-black text-white tracking-tight group-hover:text-brand-500 transition-colors uppercase">{e.hotel_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {e.check_in} — {e.check_out}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        e.tipo === "busca_ia"
                          ? "bg-brand-500/10 text-brand-500 border border-brand-500/20"
                          : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                      }`}>
                        {e.tipo === "busca_ia" ? "Busca IA" : "Análise"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest max-w-[200px] truncate">
                        {e.analise_preview}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-white tracking-tighter">
                      {e.tokens?.total > 0 ? e.tokens.total.toLocaleString("pt-BR") : <span className="text-white/10">—</span>}
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">
                      {fmtDate(e.created_at)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={(ev) => { ev.stopPropagation(); setSelected(e); }}
                        className="p-2.5 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && <AIDetailModal entry={selected} onClose={() => setSelected(null)} />}
      </>
    );
  };

  return (
    <div className="animate-in fade-in duration-700">
      <TokenStatsPanel />
      {renderContent()}
    </div>
  );
}

/* ── Page principal ── */
export default function Historico() {
  const [activeTab, setActiveTab] = useState("precos");

  const tabs = [
    { id: "precos", label: "Histórico de Preços", icon: Clock },
    { id: "ia",     label: "Análises com IA",    icon: Sparkles },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Histórico</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Registro cronológico de monitoramento e análise
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 bg-dark-card border border-dark-border p-1.5 rounded-2xl shadow-xl">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === id
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} strokeWidth={3} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="min-h-[400px]">
        {activeTab === "precos" ? (
          <div className="animate-in fade-in duration-700">
            <TabPrecos />
          </div>
        ) : (
          <TabIA />
        )}
      </div>
    </div>
  );
}
