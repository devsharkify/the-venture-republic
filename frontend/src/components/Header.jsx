import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../App";
import { Globe, Moon, Sun, Settings, ArrowLeft, LogOut, User } from "lucide-react";

export const Header = () => {
  const { language, toggleLanguage, darkMode, toggleDarkMode, isAdmin, isLoggedIn, handleLogout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        darkMode
          ? "bg-[#0A0F1C] border-slate-800"
          : "bg-white border-slate-200"
      }`}
      data-testid="header"
    >
      {/* Ticker bar — dark navy */}
      <div className="bg-[#0A0F1C] text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1 text-center select-none">
        <span className="opacity-60">The Venture Republic</span>
        <span className="mx-2 opacity-30">·</span>
        <span className="opacity-60">{language === "en" ? "India's Premium Startup & Funding Magazine" : "భారత్ యొక్క ప్రీమియం స్టార్టప్ మ్యాగజైన్"}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-3">
          {!isHomePage && (
            <button
              data-testid="back-btn"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
              className={`p-2 -ml-1 rounded-lg transition-colors ${
                darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div
            className="flex items-center cursor-pointer select-none"
            data-testid="logo"
            onClick={() => navigate("/")}
          >
            <span className={`font-serif-display text-[20px] md:text-[24px] tracking-tight leading-none ${darkMode ? "text-[#E2E8F0]" : "text-[#0F172A]"}`}>
              The Venture{" "}
            </span>
            <span className="font-serif-display text-[20px] md:text-[24px] tracking-tight leading-none text-[#0052CC]">
              Republic
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              data-testid="admin-btn"
              onClick={() => navigate("/admin")}
              className={`p-2.5 rounded-lg transition-all ${
                darkMode
                  ? "text-slate-400 hover:text-[#0052CC] hover:bg-slate-800"
                  : "text-slate-500 hover:text-[#0052CC] hover:bg-slate-100"
              }`}
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
            >
              <LogOut size={18} />
            </button>
          )}

          <button
            data-testid="dark-mode-toggle"
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-lg transition-all ${
              darkMode
                ? "text-amber-400 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            data-testid="language-toggle"
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all font-medium ${
              darkMode
                ? "border-slate-700 hover:border-[#0052CC] hover:bg-slate-800 text-slate-300"
                : "border-slate-200 hover:border-[#0052CC] hover:text-[#0052CC] text-slate-700"
            }`}
          >
            <Globe size={14} className={darkMode ? "text-slate-400" : "text-slate-500"} />
            <span className={`text-xs font-semibold ${language === "te" ? "font-telugu" : ""}`}>
              {language === "en" ? "తె" : "EN"}
            </span>
          </button>

          <button
            data-testid="profile-btn"
            onClick={() => navigate("/profile")}
            className={`p-2.5 rounded-lg transition-all ${
              location.pathname === "/profile"
                ? "text-[#0052CC] bg-blue-50 dark:bg-blue-500/10"
                : darkMode
                  ? "text-slate-400 hover:text-[#0052CC] hover:bg-slate-800"
                  : "text-slate-500 hover:text-[#0052CC] hover:bg-slate-100"
            }`}
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
