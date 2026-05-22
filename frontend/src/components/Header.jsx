import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../App";
import { Moon, Sun, Settings, ArrowLeft, Bookmark, Newspaper, Video, Rocket } from "lucide-react";

const NAV_SECTIONS = [
  { label: "Videos",        path: "/videos",        icon: Video },
  { label: "ePaper",        path: "/epaper",         icon: Newspaper },
  { label: "Startup Apply", path: "/startup-apply",  icon: Rocket },
  { label: "Saved",         path: "/saved",          icon: Bookmark },
];

export const Header = () => {
  const { darkMode, toggleDarkMode, isAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // Format today's date as "Wednesday, 20 May 2026"
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header
      className={`sticky top-0 z-50 ${
        darkMode ? "bg-[#0A0F1C]" : "bg-white"
      }`}
      data-testid="header"
    >
      {/* ── Layer 1: Thin utility bar ── */}
      <div
        className={`h-8 flex items-center ${
          darkMode
            ? "bg-[#0A0F1C] border-b border-slate-800"
            : "bg-[#0F172A]"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 w-full flex items-center justify-between">
          {/* Left: date */}
          <span className="text-[10px] font-medium tracking-wide text-slate-400">
            {formattedDate}
          </span>

          {/* Center: tagline with flanking rules — hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 justify-center -translate-x-[5%]">
            <span className="text-[7.5px] font-semibold tracking-[0.18em] uppercase text-slate-400 whitespace-nowrap">
              India&rsquo;s Premier Startup Intelligence Platform
            </span>
          </div>

          {/* Right: dark mode toggle */}
          <div className="flex items-center gap-1">
            <button
              data-testid="dark-mode-toggle"
              onClick={toggleDarkMode}
              className="p-1 rounded transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Layer 2: Masthead ── */}
      <div
        className={`py-3 ${
          darkMode
            ? "bg-[#0A0F1C] border-b border-slate-800"
            : "bg-white"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          {/* Left: back arrow (only on inner pages) */}
          <div className="flex items-center w-[80px]">
            {!isHomePage && (
              <button
                data-testid="back-btn"
                onClick={() =>
                  window.history.length > 1 ? navigate(-1) : navigate("/")
                }
                className={`p-2 -ml-1 rounded-lg transition-colors ${
                  darkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
          </div>

          {/* Center: tagline + masthead title */}
          <div
            className="flex flex-col items-center cursor-pointer select-none"
            data-testid="logo"
            onClick={() => navigate("/")}
          >
            <span
              className={`font-serif-display text-[28px] md:text-[36px] font-black tracking-tight leading-none ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              The Venture Republic
            </span>
            <hr
              className={`border-t border-current opacity-20 mx-auto w-32 mt-1 ${
                darkMode ? "text-slate-300" : "text-slate-900"
              }`}
            />
          </div>

          {/* Right: full icon row */}
          <div className="flex items-center gap-1 w-[80px] justify-end">
            {isAdmin && (
              <button
                data-testid="admin-btn"
                onClick={() => navigate("/admin")}
                className={`p-2.5 rounded-lg transition-all ${
                  darkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Admin settings"
              >
                <Settings size={18} />
              </button>
            )}

            {/* Dark mode toggle (visible on mobile; desktop uses utility bar) */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-lg transition-all md:hidden ${
                darkMode
                  ? "text-slate-400 hover:bg-slate-800"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

          </div>
        </div>
      </div>

      {/* ── Layer 3: Section nav bar ── */}
      <div
        className={`${
          darkMode
            ? "bg-[#0A0F1C] border-b border-slate-800"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 flex items-center gap-1 overflow-x-auto hide-scrollbar">
          {NAV_SECTIONS.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  flex items-center gap-1.5 flex-shrink-0
                  px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em]
                  transition-colors duration-150
                  border-b-2
                  ${isActive
                    ? "text-[#0F172A] border-[#0F172A]"
                    : darkMode
                      ? "text-slate-500 border-transparent hover:text-slate-300"
                      : "text-slate-400 border-transparent hover:text-slate-700"
                  }
                `}
              >
                <Icon size={11} strokeWidth={2.2} />
                {label}
              </button>
            );
          })}

          {/* Right side: utility links (desktop only) */}
          <div className="ml-auto hidden md:flex items-center gap-3 pl-4">
            {[
              { label: "About",         path: "/about" },
              { label: "Advertise",     path: "/advertise" },
              { label: "Write for Us",  path: "/write-for-us" },
              { label: "Contact",       path: "/contact" },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-[9.5px] font-semibold tracking-wide whitespace-nowrap transition-colors ${
                  darkMode
                    ? "text-slate-600 hover:text-slate-400"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Layer 4: Bottom accent border ── */}
      <div className="border-b-2 border-[#0F172A]" />
    </header>
  );
};
