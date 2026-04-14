import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/",         label: "Dashboard" },
  { to: "/create",   label: "Create"    },
  { to: "/simulate", label: "Simulate"  },
  { to: "/analytics",label: "Analytics" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4h1.5l2.5 8h7l2-5H6"/>
            </svg>
          </div>
          <span className="text-base font-bold text-slate-800 tracking-tight">
            Smart<span className="text-emerald-600">Supply</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            Live
          </span>
        </div>

      </div>
    </nav>
  );
}