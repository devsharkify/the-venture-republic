import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../App";
import { Moon, Sun, Settings, ArrowLeft, LogOut } from "lucide-react";

export const Header = () => {
  const { darkMode, toggleDarkMode, isAdmin, isLoggedIn, handleLogout } = useContext(AppContext);
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

          {/* Center: tagline — hidden on mobile */}
          <span className="hidden md:block text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-300">
            India&rsquo;s Premier Startup Intelligence Platform
          </span>

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

          {/* Center: masthead title + rule */}
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

            {isLoggedIn && (
              <button
                data-testid="logout-btn"
                onClick={handleLogout}
                className={`p-2.5 rounded-lg transition-all ${
                  darkMode
                    ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    : "text-slate-500 hover:text-red-500 hover:bg-red-50"
                }`}
                aria-label="Log out"
              >
                <LogOut size={18} />
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

      {/* ── Layer 3: Bottom accent border ── */}
      <div className="border-b-2 border-[#0052CC]" />
    </header>
  );
};
