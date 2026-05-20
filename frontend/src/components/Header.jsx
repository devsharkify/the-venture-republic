import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../App";
import { Moon, Sun, Settings, ArrowLeft, LogOut, User, Menu } from "lucide-react";

export const Header = () => {
  const { darkMode, toggleDarkMode, isAdmin, isLoggedIn, handleLogout } = useContext(AppContext);
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
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: hamburger (decorative) or back button */}
        <div className="flex items-center gap-2 w-[80px]">
          {!isHomePage ? (
            <button
              data-testid="back-btn"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
              className={`p-2 -ml-1 rounded-lg transition-colors ${
                darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button
              aria-label="Menu"
              className={`p-2 -ml-1 rounded-lg transition-colors ${
                darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Center: Logo */}
        <div
          className="flex items-center cursor-pointer select-none"
          data-testid="logo"
          onClick={() => navigate("/")}
        >
          <span
            className={`font-serif-display text-[22px] md:text-[28px] tracking-tight leading-none font-bold ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            The Venture Republic
          </span>
        </div>

        {/* Right: Actions */}
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
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            data-testid="profile-btn"
            onClick={() => navigate("/profile")}
            className={`p-2.5 rounded-lg transition-all ${
              location.pathname === "/profile"
                ? darkMode ? "text-slate-200 bg-slate-800" : "text-slate-900 bg-slate-100"
                : darkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
