import { useState } from "react";
import { analisarComIA, gerarRelatorioIA, downloadRelatorio } from "../api";
import { Sparkles, ChevronDown, ChevronUp, Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIAnalysis({ buscaId, hotelName, checkIn = "", checkOut = "" }) {
  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleAnalyze = async () => {
    if (result) { setOpen((o) => !o); return; }
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      const r = await analisarComIA(buscaId, hotelName);
      setResult(r);
    } catch (e) {
      setError("Erro ao analisar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const r = await gerarRelatorioIA({
        hotel_name: result.hotel_name || hotelName,
        analise: result.analise,
        check_in: checkIn,
        check_out: checkOut,
      });
      downloadRelatorio(r.filename);
    } catch (e) {
      alert("Erro ao gerar PDF: " + e.message);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="mt-4">
    <div className="mt-6">
      {/* Botão principal */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="group relative flex items-center gap-2 px-6 py-3.5 bg-brand-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-600 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        {loading ? (
          <Loader2 size={16} strokeWidth={3} className="animate-spin" />
        ) : (
          <Sparkles size={16} strokeWidth={3} />
        )}
        {loading ? "Processando..." : "Análise Inteligente"}
        {result && !loading && (open ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />)}
      </button>

      {open && (
        <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-3xl -mr-16 -mt-16" />
          
          {/* Header do painel IA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-500">
                <Sparkles size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest block mb-0.5">
                  Insights Gerados
                </span>
                <span className="text-sm font-black text-white uppercase tracking-tight">
                  {result?.hotel_name || hotelName}
                </span>
              </div>
            </div>

            {/* Botão Download PDF */}
            {result && !loading && (
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-all"
              >
                {pdfLoading ? (
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <FileText size={14} strokeWidth={3} />
                )}
                {pdfLoading ? "Gerando..." : "Exportar PDF"}
              </button>
            )}
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="flex items-center gap-3 text-[10px] font-black text-brand-500 uppercase tracking-widest py-8">
              <Loader2 size={20} strokeWidth={3} className="animate-spin" />
              Sincronizando dados e gerando insights...
            </div>
          ) : error ? (
            <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 rounded-2xl px-6 py-4">{error}</div>
          ) : result ? (
            <div className="prose prose-invert prose-sm max-w-none text-white/70 font-medium leading-relaxed">
              <ReactMarkdown>{result.analise}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      )}
    </div>
    </div>
  );
}
