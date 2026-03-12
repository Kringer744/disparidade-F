import { useEffect, useState, useCallback } from "react";
import { getDashboard, buscarTodosClientes, getComparacao } from "../api";
import DisparityCard from "../components/DisparityCard";
import AIAnalysis from "../components/AIAnalysis";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  RefreshCw, X, TrendingDown, TrendingUp, ExternalLink, CheckCircle, AlertTriangle, Building2, HelpCircle
} from "lucide-react";

const fmt = (v) =>
  v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "—";

function StatBox({ value, label, color, icon: Icon }) {
  return (
    <div className={`bg-dark-card rounded-2xl p-6 border border-dark-border shadow-sm group hover:border-brand-500/50 transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className="text-3xl font-black text-white tracking-tight">{value}</div>
        {Icon && <Icon className={`opacity-20 group-hover:opacity-100 transition-opacity ${color}`} size={24} />}
      </div>
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</div>
      <div className={`h-1 w-8 rounded-full mt-3 ${color.replace('text-', 'bg-')}`} />
    </div>
  );
}

/* ── Modal de comparação OTAs ── */
function ComparisonModal({ card, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!card?.ultima_busca_id) { setLoading(false); return; }
    getComparacao(card.ultima_busca_id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [card]);

  if (!card) return null;

  const baratas = data?.otas_mais_baratas ?? [];
  const caras   = data?.otas_mais_caras   ?? [];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-dark-card border border-dark-border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-dark-border shrink-0 bg-gradient-to-r from-transparent to-brand-500/5">
          <div>
            <h2 className="font-black text-xl text-white tracking-tight">{card.nome}</h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">{card.localizacao}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="text-center text-white/20 py-12 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando comparação...</div>
          ) : !data ? (
            <div className="text-center text-white/20 py-12 font-bold uppercase tracking-widest text-xs">Sem dados disponíveis.</div>
          ) : (
            <>
              {/* Preço Oficial */}
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl px-6 py-5 flex items-center justify-between group">
                <div>
                  <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">
                    Preço Oficial do Hotel
                  </div>
                  <div className="text-3xl font-black text-white">
                    {fmt(data.preco_direto)}
                  </div>
                </div>
                {data.status === "ok" ? (
                  <CheckCircle size={36} className="text-brand-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                ) : (
                  <AlertTriangle size={36} className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
                )}
              </div>

              {/* Resumo contadores */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-2xl p-5 transition-all ${baratas.length > 0 ? "bg-orange-500/5 border border-orange-500/20" : "bg-white/5 border border-white/5"}`}>
                  <div className={`text-4xl font-black ${baratas.length > 0 ? "text-orange-500" : "text-white/20"}`}>
                    {baratas.length}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">
                    <TrendingDown size={14} strokeWidth={3} />
                    OTAs BARATAS
                  </div>
                </div>
                <div className={`rounded-2xl p-5 transition-all ${caras.length > 0 ? "bg-brand-500/5 border border-brand-500/20" : "bg-white/5 border border-white/5"}`}>
                  <div className={`text-4xl font-black ${caras.length > 0 ? "text-brand-500" : "text-white/20"}`}>
                    {caras.length}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">
                    <TrendingUp size={14} strokeWidth={3} />
                    OTAs CARAS
                  </div>
                </div>
              </div>

              {/* OTAs mais baratas */}
              {baratas.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TrendingDown size={14} strokeWidth={3} /> OTAs mais baratas que o oficial
                  </h3>
                  <div className="space-y-2">
                    {baratas.map((o, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 hover:border-orange-500/30 rounded-xl px-5 py-4 transition-all group">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">{o.ota_nome}</div>
                          <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                            {fmt(o.diferenca_valor)} abaixo ({o.diferenca_pct?.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 shrink-0">
                          <span className="font-black text-white text-lg">{fmt(o.preco_total)}</span>
                          {o.link && (
                            <a href={o.link} target="_blank" rel="noopener noreferrer"
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-brand-500 transition-all">
                              <ExternalLink size={14} strokeWidth={3} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {card?.ultima_busca_id && (
                <div className="pt-2">
                  <AIAnalysis buscaId={card.ultima_busca_id} hotelName={card.nome} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected,   setSelected]   = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await getDashboard());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await buscarTodosClientes();
      await load();
    } catch (e) {
      alert("Erro ao atualizar: " + e.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-gray-400">Erro ao carregar dashboard.</div>;

  const { cards = [], total_clientes, total_disparidade, total_ok, total_sem_dados } = data;

  const chartData = cards
    .filter((c) => c.preco_direto && c.menor_preco_ota)
    .slice(0, 10)
    .map((c) => ({
      name: c.nome.length > 16 ? c.nome.slice(0, 16) + "…" : c.nome,
      direto: c.preco_direto,
      ota: c.menor_preco_ota,
      status: c.status,
    }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Monitoramento de disparidade em tempo real</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/20"
        >
          <RefreshCw size={16} strokeWidth={3} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Atualizando..." : "Sincronizar"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatBox value={total_clientes}    label="Hotéis Monitorados" color="text-white/40" icon={Building2} />
        <StatBox value={total_disparidade} label="Com Disparidade"    color="text-orange-500" icon={AlertTriangle} />
        <StatBox value={total_ok}          label="Sem Disparidade"    color="text-brand-500" icon={CheckCircle} />
        <StatBox value={total_sem_dados}   label="Sem Dados"          color="text-white/20" icon={HelpCircle} />
      </div>

      {/* Cards — principais, acima do gráfico */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
          Hotéis Monitorados <span className="text-brand-500 ml-1">({cards.length})</span>
        </h2>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Clique para ver detalhes</span>
      </div>
      {cards.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-16 text-center shadow-sm mb-12">
          <div className="text-white/20 font-black uppercase tracking-widest text-xs">
            Nenhum hotel cadastrado ainda. <br />
            Acesse <strong className="text-brand-500">Hotéis</strong> para adicionar clientes.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <DisparityCard key={card.cliente_id} card={card} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                Análise Comparativa
              </h2>
              <h3 className="text-xl font-black text-white">Preço Oficial vs Menor OTA</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Oficial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Paridade OK</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Disparidade</span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barCategoryGap="30%" barGap={8}>
              <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis
                tick={{ fontSize: 10, fill: '#666', fontWeight: 600 }}
                tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ 
                  backgroundColor: '#0f0f0f', 
                  border: '1px solid #1f1f1f', 
                  borderRadius: '16px', 
                  padding: '12px 16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                labelStyle={{ color: '#fff', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}
                formatter={(v) => [fmt(v), '']}
              />
              <Bar dataKey="direto" name="Oficial" fill="rgba(255,255,255,0.1)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="ota" name="OTA" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.status === "disparidade" ? "#f97316" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selected && (
        <ComparisonModal card={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
