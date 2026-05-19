import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../App";
import { Home, Bookmark, Layers, Video, Newspaper } from "lucide-react";

export const BottomNav = () => {
  const { language, darkMode } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: language === "en" ? "Home" : "హోమ్" },
    { path: "/swipe", icon: Layers, label: language === "en" ? "Shorts" : "షార్ట్స్" },
    { path: "/epaper", icon: Newspaper, label: language === "en" ? "ePaper" : "ఈ-పేపర్" },
    { path: "/videos", icon: Video, label: language === "en" ? "Video" : "వీడియో" },
    { path: "/saved", icon: Bookmark, label: language === "en" ? "Saved" : "సేవ్డ్" }
  ];

  return (
    <nav 
      className={`bottom-nav ${
        darkMode 
          ? "bg-slate-900/90 border-slate-800" 
          : "bg-white/90 border-slate-200"
      }`} 
      data-testid="bottom-nav"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.label}
              data-testid={`nav-${item.path === "/" ? "home" : item.label.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive 
                  ? "text-orange-500" 
                  : darkMode 
                    ? "text-slate-500 hover:text-slate-300" 
                    : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="mb-0.5" />
              <span className={`text-[10px] tracking-wide ${isActive ? "font-bold" : "font-medium"} ${language === "te" ? "font-telugu" : ""}`}>
                {item.label}
              </span>
              {isActive && <div className="w-1 h-1 bg-orange-500 rounded-full mt-0.5 dot-pulse" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
