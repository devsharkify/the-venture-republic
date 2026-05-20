import { useContext } from "react";
import { AppContext } from "../App";

export const Footer = () => {
  const { darkMode } = useContext(AppContext);
  return (
    <footer className={`mt-16 border-t py-8 ${darkMode ? "bg-[#0A0F1C] border-slate-800" : "bg-white border-slate-200"}`}>
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className={`font-serif-display text-[18px] font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            The Venture Republic
          </span>
          <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Bangalore, India &nbsp;·&nbsp; India's Startup Intelligence Platform
          </p>
        </div>
        <p className={`text-[11px] ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
          © {new Date().getFullYear()} The Venture Republic. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
