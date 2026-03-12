import { useEffect, useState } from "react";
import { getRelatorios, gerarRelatorio, getClientes, downloadRelatorio } from "../api";
import { FileText, Download, Plus } from "lucide-react";

const today = new Date().toISOString().slice(0, 10);
const firstOfMonth = new Date();
firstOfMonth.setDate(1);
const firstOfMonthStr = firstOfMonth.toISOString().slice(0, 10);

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    cliente_id: "",
    periodo_inicio: firstOfMonthStr,
    periodo_fim: today,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([getRelatorios(), getClientes()]);
      setRelatorios(r);
      setClientes(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGerar = async () => {
    setGenerating(true);
    try {
      const payload = {
        periodo_inicio: form.periodo_inicio,
        periodo_fim: form.periodo_fim,
        cliente_id: form.cliente_id ? Number(form.cliente_id) : null,
      };
      const result = await gerarRelatorio(payload);
      downloadRelatorio(result.filename);
      await load();
    } catch (e) {
      alert("Erro ao gerar relatório: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const fmtDate = (str) =>
    str ? new Date(str + "T00:00:00").toLocaleDateString("pt-BR") : "—";
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Relatórios PDF</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Gere e baixe relatórios analíticos de disparidade
          </p>
        </div>
      </div>

      {/* Gerar novo Card */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <h2 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-8 flex items-center gap-2">
          <Plus size={14} strokeWidth={3} /> Gerar Novo Relatório Analítico
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Hotel (opcional)</label>
            <div className="relative group">
              <select
                value={form.cliente_id}
                onChange={(e) => setForm((f) => ({ ...f, cliente_id: e.target.value }))}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="" className="bg-dark-card text-white">Todos os hotéis cadastrados</option>
                {clientes.map((c) => (
                  <option key={c.Id} value={c.Id} className="bg-dark-card text-white">{c.nome}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                ▼
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Data Inicial</label>
            <input
              type="date"
              value={form.periodo_inicio}
              onChange={(e) => setForm((f) => ({ ...f, periodo_inicio: e.target.value }))}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold cursor-pointer"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Data Final</label>
            <input
              type="date"
              value={form.periodo_fim}
              onChange={(e) => setForm((f) => ({ ...f, periodo_fim: e.target.value }))}
              className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all font-bold cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleGerar}
          disabled={generating}
          className="mt-10 flex items-center justify-center gap-3 bg-brand-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/20"
        >
          {generating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FileText size={18} strokeWidth={3} />}
          {generating ? "Gerando PDF..." : "Gerar e Baixar Relatorio PDF"}
        </button>
      </div>

      {/* Histórico Card */}
      <div className="bg-dark-card border border-dark-border rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-dark-border flex items-center justify-between">
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Relatórios Gerados Anteriormente</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
          </div>
        ) : relatorios.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto mb-4 text-white/5" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhum relatório gerado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-dark-border">
                  <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Identificador do Arquivo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Período de Análise</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {relatorios.map((r, i) => (
                  <tr key={r.Id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-brand-500/50" />
                        <span className="font-mono text-[11px] text-white/60 group-hover:text-white transition-colors uppercase">{r.pdf_path}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        {fmtDate(r.periodo_inicio)} — {fmtDate(r.periodo_fim)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => downloadRelatorio(r.pdf_path)}
                        className="inline-flex items-center gap-2.5 bg-white/5 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group-hover:shadow-lg group-hover:shadow-brand-500/10"
                      >
                        <Download size={14} strokeWidth={3} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
