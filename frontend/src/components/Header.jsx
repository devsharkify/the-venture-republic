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
      className={`sticky top-0 z-50 glass-header border-b ${
        darkMode 
          ? "bg-slate-900/85 border-slate-800/60" 
          : "bg-white/85 border-slate-200/60"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              data-testid="admin-btn"
              onClick={() => navigate("/admin")}
              className={`p-2.5 rounded-lg transition-all ${
                darkMode 
                  ? "text-slate-400 hover:text-orange-400 hover:bg-slate-800" 
                  : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
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
                ? "border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 text-slate-300" 
                : "border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-700"
            }`}
          >
            <Globe size={14} className="text-orange-500" />
            <span className={`text-xs font-semibold ${language === "te" ? "font-telugu" : ""}`}>
              {language === "en" ? "\u0C24\u0C46" : "EN"}
            </span>
          </button>

          <button
            data-testid="profile-btn"
            onClick={() => navigate("/profile")}
            className={`p-2.5 rounded-lg transition-all ${
              location.pathname === "/profile"
                ? "text-orange-500 bg-orange-50 dark:bg-orange-500/10"
                : darkMode 
                  ? "text-slate-400 hover:text-orange-400 hover:bg-slate-800" 
                  : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
