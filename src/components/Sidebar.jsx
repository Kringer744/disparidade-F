import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Search, 
  FileText, 
  Clock, 
  ChevronDown, 
  MessageSquare, 
  ShieldCheck, 
  Home
} from "lucide-react";

const navGroups = [
  {
    id: "home",
    type: "single",
    to: "/",
    icon: Home,
    label: "Home"
  },
  {
    id: "hotelaria",
    label: "Hotelaria",
    icon: Building2,
    items: [
      { to: "/clientes", label: "Hotéis" },
      { to: "/busca", label: "Busca Manual" },
    ]
  },
  {
    id: "inteligencia",
    label: "Inteligência",
    icon: FileText,
    items: [
      { to: "/historico", label: "Histórico" },
      { to: "/relatorios", label: "Relatórios" },
    ]
  }
];

const footerLinks = [
  { icon: MessageSquare, label: "Feedback" },
  { icon: ShieldCheck, label: "Ajuda", badge: 5 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-dark-bg flex flex-col border-r border-dark-border select-none">
      {/* Brand Header */}
      <div className="px-7 py-9 shrink-0">
        <div className="text-white font-black text-2xl tracking-tight flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            🏨
          </div>
          Disparidade
        </div>
        <div className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mt-2.5 px-0.5">
          Monitor de Preços
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar pt-2 pb-8">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {group.type === "single" ? (
              <NavLink
                to={group.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-white/10 text-white shadow-xl"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <group.icon size={18} strokeWidth={2.5} />
                {group.label}
              </NavLink>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-4 py-2.5 text-white/40 group cursor-default">
                  <div className="flex items-center gap-3">
                    <group.icon size={18} strokeWidth={2.5} className="group-hover:text-white/60 transition-colors" />
                    <span className="text-[13px] font-bold group-hover:text-white/60 transition-colors">{group.label}</span>
                  </div>
                  <ChevronDown size={14} className="text-white/20 group-hover:text-white/40 transition-transform duration-300" />
                </div>
                
                <div className="ml-6 pl-4 border-l border-white/5 space-y-1 mt-1 relative">
                  {/* Vertical Line Connector */}
                  <div className="absolute left-0 top-0 bottom-4 w-px bg-white/5" />
                  
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `block px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 ${
                          isActive
                            ? "text-brand-500 bg-brand-500/5"
                            : "text-white/20 hover:text-white/60 hover:bg-white/5"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Links */}
      <div className="px-4 py-6 border-t border-dark-border space-y-1 shrink-0">
        {footerLinks.map((link) => (
          <button
            key={link.label}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <link.icon size={18} strokeWidth={2.5} className="group-hover:text-white transition-colors" />
              <span className="text-[13px] font-bold">{link.label}</span>
            </div>
            {link.badge && (
              <span className="bg-brand-500/20 text-brand-500 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-brand-500/10">
                {link.badge}
              </span>
            )}
          </button>
        ))}

        <div className="mt-6 flex items-center gap-3 px-4 opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="text-[10px] font-black uppercase tracking-widest text-white/50">v1.2.0 Stable</div>
        </div>
      </div>
    </aside>
  );
}
