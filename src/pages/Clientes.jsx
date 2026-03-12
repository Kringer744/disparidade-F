import { useEffect, useState } from "react";
import { getClientes, createCliente, updateCliente, deleteCliente } from "../api";
import { Plus, Pencil, Trash2, X, Check, Building2, Loader2 } from "lucide-react";

const empty = { nome: "", localizacao: "", serpapi_query: "", website: "", preco_direto_manual: "", ativo: true };

function Modal({ title, data, onChange, onSave, onClose, loading }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-dark-card border border-dark-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-dark-border bg-gradient-to-r from-transparent to-brand-500/5">
          <h2 className="font-black text-white text-xl tracking-tight uppercase">{title}</h2>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 text-white/40 hover:text-white rounded-xl transition-all">
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="px-8 py-6 space-y-6">
          <Field label="Nome do Hotel *" value={data.nome}
            onChange={(v) => onChange("nome", v)} placeholder="Ex: Hotel Fasano São Paulo" />
          <Field label="Localização *" value={data.localizacao}
            onChange={(v) => onChange("localizacao", v)} placeholder="Ex: São Paulo, SP" />
          <Field
            label="Termo de busca SERPAPI *"
            value={data.serpapi_query}
            onChange={(v) => onChange("serpapi_query", v)}
            placeholder='Ex: "Fasano São Paulo" hotel'
            hint="Exatamente como você buscaria no Google Hotels"
          />
          <Field label="Website oficial" value={data.website}
            onChange={(v) => onChange("website", v)} placeholder="https://www.fasano.com.br" />
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">
              Preço Oficial (site do hotel)
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 font-black group-focus-within:text-brand-500 transition-colors">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={data.preco_direto_manual}
                onChange={(e) => onChange("preco_direto_manual", e.target.value ? Number(e.target.value) : "")}
                placeholder="0,00"
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 placeholder:text-white/10 transition-all"
              />
            </div>
          </div>
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative w-5 h-5">
              <input
                type="checkbox"
                checked={data.ativo}
                onChange={(e) => onChange("ativo", e.target.checked)}
                className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-5 h-5 border-2 border-white/10 rounded-lg bg-white/5 peer-checked:bg-brand-500 peer-checked:border-brand-500 transition-all flex items-center justify-center">
                <Check size={14} strokeWidth={4} className="text-white scale-0 peer-checked:scale-100 transition-transform" />
              </div>
            </div>
            <span className="text-sm text-white/60 font-bold group-hover:text-white transition-colors">Ativo (monitorar automaticamente)</span>
          </label>
        </div>
        <div className="px-8 py-6 border-t border-dark-border flex justify-end gap-4 bg-white/[0.02]">
          <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={loading || !data.nome || !data.serpapi_query}
            className="px-8 py-3 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
          >
            {loading ? <Loader2 size={16} strokeWidth={3} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, hint }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 placeholder:text-white/10 transition-all"
      />
      {hint && <p className="text-[10px] text-brand-500/50 font-bold uppercase tracking-widest mt-2 px-1">{hint}</p>}
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "add" | {editing: cliente}
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setClientes(await getClientes());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setModal("add"); };
  const openEdit = (c) => {
    setForm({
      nome: c.nome,
      localizacao: c.localizacao,
      serpapi_query: c.serpapi_query,
      website: c.website || "",
      preco_direto_manual: c.preco_direto_manual ?? "",
      ativo: c.ativo ?? true,
    });
    setModal({ editing: c });
  };

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "add") {
        await createCliente(form);
      } else {
        await updateCliente(modal.editing.Id, form);
      }
      setModal(null);
      await load();
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Excluir ${c.nome}?`)) return;
    await deleteCliente(c.Id);
    await load();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Hotéis</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Gerenciamento de unidades monitoradas <span className="text-brand-500 ml-1">({clientes.length})</span></p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus size={18} strokeWidth={3} /> Adicionar Hotel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : clientes.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-24 text-center shadow-sm">
          <Building2 size={64} strokeWidth={1} className="mx-auto mb-6 text-white/10" />
          <p className="text-white/40 font-black uppercase tracking-widest text-xs">Nenhum hotel cadastrado ainda.</p>
          <button onClick={openAdd} className="mt-6 text-brand-500 font-black text-xs uppercase tracking-widest hover:text-brand-600 transition-colors">
            Adicionar o primeiro hotel
          </button>
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <table className="w-full text-sm relative z-10">
            <thead>
              <tr className="bg-white/5 border-b border-dark-border text-left">
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Hotel</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Localização</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">SERPAPI Query</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Preço Oficial</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {clientes.map((c, i) => (
                <tr key={c.Id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-black text-white group-hover:text-brand-500 transition-colors uppercase tracking-tight">{c.nome}</div>
                    <div className="text-[10px] text-white/20 font-bold truncate max-w-[150px]">{c.website}</div>
                  </td>
                  <td className="px-8 py-6 text-white/60 font-medium">{c.localizacao}</td>
                  <td className="px-8 py-6">
                    <code className="text-[10px] bg-white/5 text-white/40 px-3 py-1.5 rounded-lg font-mono">{c.serpapi_query}</code>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-white text-base">
                    {c.preco_direto_manual
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.preco_direto_manual)
                      : <span className="text-white/10 font-black text-[10px] uppercase tracking-widest">N/D</span>}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      c.ativo ? "bg-brand-500/10 text-brand-500" : "bg-white/5 text-white/20"
                    }`}>
                      {c.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)}
                        className="p-2.5 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleDelete(c)}
                        className="p-2.5 text-white/20 hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all">
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "add" ? "Adicionar Hotel" : "Editar Hotel"}
          data={form}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}
    </div>
  );
}
