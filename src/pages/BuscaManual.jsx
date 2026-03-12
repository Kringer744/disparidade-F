import { useState, useEffect } from "react";
import { buscarHotel, getClientes, gerarRelatorio, downloadRelatorio, buscarAnalisarIA } from "../api";
import { Search, CheckCircle, AlertTriangle, ExternalLink, TrendingDown, TrendingUp, FileText, Sparkles, Loader2 } from "lucide-react";
import AIAnalysis from "../components/AIAnalysis";
import ReactMarkdown from "react-markdown";

const today = new Date();
const plus30 = new Date(today); plus30.setDate(plus30.getDate() + 30);
const plus31 = new Date(today); plus31.setDate(plus31.getDate() + 31);
const toDateInput = (d) => d.toISOString().slice(0, 10);

const fmt = (v) =>
  v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "—";

export default function BuscaManual() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    mode: "manual",
    cliente_id: "",
    query: "",
    check_in: toDateInput(plus30),
    check_out: toDateInput(plus31),
    adultos: 2,
    quartos: 1,
    currency: "BRL",
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult,  setIaResult]  = useState(null);

  useEffect(() => { getClientes().then(setClientes).catch(() => {}); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSearch = async () => {
    setError(""); setResult(null); setLoading(true);
    try {
      const payload = {
        check_in: form.check_in,
        check_out: form.check_out,
        adultos: Number(form.adultos),
        quartos: Number(form.quartos),
        currency: form.currency,
      };
      if (form.mode === "cliente" && form.cliente_id) {
        payload.cliente_id = Number(form.cliente_id);
      } else {
        if (!form.query) { setError("Digite o nome do hotel."); setLoading(false); return; }
        payload.query = form.query;
      }
      setResult(await buscarHotel(payload));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarIA = async () => {
    const query = form.mode === "cliente" && form.cliente_id
      ? clientes.find((c) => c.Id === Number(form.cliente_id))?.nome || form.query
      : form.query;
    if (!query) { alert("Digite o nome do hotel primeiro."); return; }
    setIaLoading(true); setIaResult(null);
    try {
      const r = await buscarAnalisarIA({
        hotel_name: query,
        check_in: form.check_in,
        check_out: form.check_out,
        adultos: Number(form.adultos),
      });
      setIaResult(r);
    } catch (e) {
      alert("Erro na busca IA: " + e.message);
    } finally {
      setIaLoading(false);
    }
  };

  const handleGerarPdf = async () => {
    if (!result) return;
    setGeneratingPdf(true);
    try {
      const payload = {
        periodo_inicio: result.check_in,
        periodo_fim: result.check_out,
        cliente_id: form.mode === "cliente" && form.cliente_id ? Number(form.cliente_id) : null,
      };
      const r = await gerarRelatorio(payload);
      downloadRelatorio(r.filename);
    } catch (e) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const disp = result?.disparidade;
  const baratas = disp?.otas_mais_baratas ?? [];
  const caras   = disp?.otas_mais_caras   ?? [];
  const precoOficial = result?.preco_direto;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Busca Manual</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Pesquise preços de um hotel específico agora</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex gap-4 mb-8">
          {["manual", "cliente"].map((m) => (
            <button key={m} onClick={() => set("mode", m)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                form.mode === m 
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" 
                : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
              }`}>
              {m === "manual" ? "Digitar Nome" : "Hotel Cadastrado"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4">
            {form.mode === "manual" ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Nome do Hotel</label>
                <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-500 transition-colors" />
                  <input type="text" value={form.query} onChange={(e) => set("query", e.target.value)}
                    placeholder='Ex: "Hotel Fasano São Paulo"'
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 placeholder:text-white/10 transition-all font-bold" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Hotel Cadastrado</label>
                <div className="relative group">
                  <select value={form.cliente_id} onChange={(e) => set("cliente_id", e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold appearance-none">
                    <option value="" className="bg-dark-card text-white">Selecione um hotel...</option>
                    {clientes.map((c) => (
                      <option key={c.Id} value={c.Id} className="bg-dark-card text-white">{c.nome} — {c.localizacao}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    ▼
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Check-in</label>
            <input type="date" value={form.check_in} onChange={(e) => set("check_in", e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Check-out</label>
            <input type="date" value={form.check_out} onChange={(e) => set("check_out", e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Adultos</label>
            <input type="number" min="1" max="10" value={form.adultos} onChange={(e) => set("adultos", e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Moeda</label>
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold appearance-none">
              <option value="BRL" className="bg-dark-card text-white">BRL — Real</option>
              <option value="USD" className="bg-dark-card text-white">USD — Dólar</option>
              <option value="EUR" className="bg-dark-card text-white">EUR — Euro</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-8 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button onClick={handleSearch} disabled={loading || iaLoading}
            className="flex-1 flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} strokeWidth={3} />}
            {loading ? "Buscando..." : "Buscar Preços"}
          </button>
          
          <button onClick={handleBuscarIA} disabled={loading || iaLoading}
            className="flex-1 flex items-center justify-center gap-3 bg-brand-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all">
            {iaLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} strokeWidth={3} />}
            {iaLoading ? "AI Analisando..." : "Busca Super Inteligente"}
          </button>
        </div>
      </div>

      {/* Result Section */}
      <div className="space-y-8 pb-12">
        {iaResult && (
          <div className="bg-brand-500/5 border border-brand-500/10 rounded-3xl p-8 relative overflow-hidden group animate-in slide-in-from-bottom-4">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={20} className="text-brand-500" strokeWidth={3} />
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Análise Completa com IA — {iaResult.hotel_name}</span>
            </div>
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
                {iaResult.analise}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            {/* Detailed Info Card */}
            <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                {result.thumbnail && (
                  <img src={result.thumbnail} alt="" className="w-32 h-32 object-cover rounded-3xl shrink-0 grayscale group-hover:grayscale-0 transition-all border border-white/5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight uppercase">{result.hotel_name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          {result.check_in} → {result.check_out}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{result.nights} noites</span>
                        {result.rating && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{result.rating}★ ({result.reviews} avaliações)</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleGerarPdf}
                      disabled={generatingPdf}
                      className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 disabled:opacity-50 transition-all border border-white/5"
                    >
                      <FileText size={16} strokeWidth={3} />
                      {generatingPdf ? "Gerando..." : "Gerar PDF"}
                    </button>
                  </div>

                  {/* Preço Oficial Premium Panel */}
                  <div className={`rounded-3xl p-6 flex items-center justify-between border-2 ${
                    disp?.status === "ok" 
                    ? "bg-brand-500/5 border-brand-500/20" 
                    : "bg-orange-500/5 border-orange-500/20"
                  }`}>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                        disp?.status === "ok" ? "text-brand-500" : "text-orange-500"
                      }`}>
                        Preço Oficial Detectado
                        {result.direct_source && <span className="ml-2 text-white/20">({result.direct_source})</span>}
                      </div>
                      <div className="text-4xl font-black text-white tracking-tighter">{fmt(precoOficial)}</div>
                    </div>
                    {disp?.status === "ok"
                      ? <CheckCircle size={48} className="text-brand-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" strokeWidth={2} />
                      : <AlertTriangle size={48} className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" strokeWidth={2} />}
                  </div>
                </div>
              </div>

              {/* Instant Analysis */}
              {result.busca_id && (
                <div className="mt-8 pt-8 border-t border-dark-border">
                  <AIAnalysis buscaId={result.busca_id} hotelName={result.hotel_name} />
                </div>
              )}
            </div>

            {/* Side-by-side OTAs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Baratas (Disparidade) */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest px-4">
                  <TrendingDown size={14} strokeWidth={3} /> {baratas.length} OTAs Vendendo por Menos
                </h3>
                {baratas.length === 0 ? (
                  <div className="bg-dark-card border border-dark-border rounded-3xl p-12 text-center">
                    <CheckCircle size={32} className="mx-auto mb-4 text-white/5" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhuma disparidade negativa encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {baratas.map((o, i) => (
                      <div key={i} className="bg-dark-card border border-dark-border hover:border-orange-500/30 rounded-2xl p-6 transition-all group flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">{o.ota_nome}</div>
                          <div className="text-[10px] text-orange-500/60 font-black uppercase tracking-widest mt-1">
                            {fmt(o.diferenca_valor)} abaixo ({o.diferenca_pct?.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-6 ml-4">
                          <span className="text-2xl font-black text-white tracking-tight">{fmt(o.preco_total)}</span>
                          {o.link && (
                            <a href={o.link} target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-orange-500 transition-all">
                              <ExternalLink size={16} strokeWidth={3} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Caras (Paridade) */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase tracking-widest px-4">
                  <TrendingUp size={14} strokeWidth={3} /> {caras.length} OTAs Vendendo por Mais
                </h3>
                {caras.length === 0 ? (
                  <div className="bg-dark-card border border-dark-border rounded-3xl p-12 text-center">
                    <TrendingUp size={32} className="mx-auto mb-4 text-white/5" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Todas as OTAs estão na média</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {caras.map((o, i) => (
                      <div key={i} className="bg-dark-card border border-dark-border hover:border-brand-500/30 rounded-2xl p-6 transition-all group flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-white group-hover:text-brand-500 transition-colors uppercase tracking-tight">{o.ota_nome}</div>
                          <div className="text-[10px] text-brand-500/60 font-black uppercase tracking-widest mt-1">
                            {fmt(Math.abs(o.diferenca_valor))} acima ({Math.abs(o.diferenca_pct)?.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-6 ml-4">
                          <span className="text-2xl font-black text-white tracking-tight">{fmt(o.preco_total)}</span>
                          {o.link && (
                            <a href={o.link} target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-brand-500 transition-all">
                              <ExternalLink size={16} strokeWidth={3} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
