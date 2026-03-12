import { AlertTriangle, CheckCircle, HelpCircle, TrendingDown, TrendingUp } from "lucide-react";

const STATUS_CONFIG = {
  disparidade: {
    bg: "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40",
    badge: "bg-orange-500/10 text-orange-500",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    label: "Disparidade",
  },
  ok: {
    bg: "bg-brand-500/5 border-brand-500/20 hover:border-brand-500/40",
    badge: "bg-brand-500/10 text-brand-500",
    icon: CheckCircle,
    iconColor: "text-brand-500",
    label: "Em Paridade",
  },
  sem_dados: {
    bg: "bg-white/5 border-white/5 hover:border-white/10",
    badge: "bg-white/10 text-white/40",
    icon: HelpCircle,
    iconColor: "text-white/20",
    label: "Sem dados",
  },
};

function fmt(val) {
  if (val == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

export default function DisparityCard({ card, onClick }) {
  const cfg = STATUS_CONFIG[card.status] || STATUS_CONFIG.sem_dados;
  const Icon = cfg.icon;

  const countBaratas = card.count_mais_baratas ?? 0;
  const countCaras   = card.count_mais_caras   ?? 0;

  return (
    <div
      onClick={() => onClick?.(card)}
      className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 group ${cfg.bg}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white truncate text-lg tracking-tight group-hover:text-brand-500 transition-colors">{card.nome}</h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1 truncate">{card.localizacao}</p>
        </div>
        <span className={`ml-3 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0 ${cfg.badge}`}>
          <Icon size={12} strokeWidth={3} />
          {cfg.label}
        </span>
      </div>

      {/* Preço oficial */}
      <div className="flex items-center justify-between py-4 border-t border-b border-white/5 mb-4 group-hover:border-white/10 transition-colors">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Preço Oficial</span>
        <span className="font-black text-white text-base group-hover:scale-110 transition-transform origin-right">{fmt(card.preco_direto)}</span>
      </div>

      {/* Contadores OTAs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`rounded-xl px-4 py-3 transition-all ${countBaratas > 0 ? "bg-orange-500/10 border border-orange-500/20" : "bg-white/5 border border-white/5"}`}>
          <div className={`text-2xl font-black ${countBaratas > 0 ? "text-orange-500" : "text-white/10"}`}>
            {countBaratas}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">
            <TrendingDown size={11} strokeWidth={3} />
            Baratas
          </div>
        </div>
        <div className={`rounded-xl px-4 py-3 transition-all ${countCaras > 0 ? "bg-brand-500/10 border border-brand-500/20" : "bg-white/5 border border-white/5"}`}>
          <div className={`text-2xl font-black ${countCaras > 0 ? "text-brand-500" : "text-white/10"}`}>
            {countCaras}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">
            <TrendingUp size={11} strokeWidth={3} />
            Caras
          </div>
        </div>
      </div>

      {/* Pior disparidade */}
      {countBaratas > 0 && card.ota_mais_barata && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 text-[10px] flex items-center justify-between group-hover:bg-orange-500/20 transition-all">
          <span className="font-bold text-orange-500 uppercase tracking-tight">{card.ota_mais_barata}</span>
          <div className="text-white font-black">
            {fmt(card.menor_preco_ota)}
            {card.diferenca_pct != null && (
              <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-lg ml-2">-{Math.abs(card.diferenca_pct).toFixed(0)}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
