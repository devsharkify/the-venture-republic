import { useContext, useRef, useEffect } from "react";
import { AppContext } from "../App";

export const CategoryChips = ({ activeCategory, onCategoryChange }) => {
  const { language, categories, darkMode } = useContext(AppContext);
  const scrollRef = useRef(null);

  const categoryList = [
    { key: "all", en: "All News", te: "అన్ని వార్తలు" },
    ...Object.entries(categories).map(([key, value]) => ({
      key,
      en: value.en,
      te: value.te
    }))
  ];

  useEffect(() => {
    if (scrollRef.current && activeCategory) {
      const activeChip = scrollRef.current.querySelector(`[data-category="${activeCategory}"]`);
      if (activeChip) {
        activeChip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [activeCategory]);

  const getCategoryColor = (key) => {
    const colors = {
      "local": { light: "border-amber-300 bg-amber-50 text-amber-700", dark: "border-amber-600/40 bg-amber-900/20 text-amber-300" },
      "city": { light: "border-blue-300 bg-blue-50 text-blue-700", dark: "border-blue-600/40 bg-blue-900/20 text-blue-300" },
      "state": { light: "border-purple-300 bg-purple-50 text-purple-700", dark: "border-purple-600/40 bg-purple-900/20 text-purple-300" },
      "national": { light: "border-green-300 bg-green-50 text-green-700", dark: "border-green-600/40 bg-green-900/20 text-green-300" },
      "international": { light: "border-rose-300 bg-rose-50 text-rose-700", dark: "border-rose-600/40 bg-rose-900/20 text-rose-300" },
      "sports": { light: "border-emerald-300 bg-emerald-50 text-emerald-700", dark: "border-emerald-600/40 bg-emerald-900/20 text-emerald-300" },
      "entertainment": { light: "border-violet-300 bg-violet-50 text-violet-700", dark: "border-violet-600/40 bg-violet-900/20 text-violet-300" },
      "tech": { light: "border-indigo-300 bg-indigo-50 text-indigo-700", dark: "border-indigo-600/40 bg-indigo-900/20 text-indigo-300" },
      "health": { light: "border-teal-300 bg-teal-50 text-teal-700", dark: "border-teal-600/40 bg-teal-900/20 text-teal-300" },
      "business": { light: "border-slate-300 bg-slate-50 text-slate-700", dark: "border-slate-600/40 bg-slate-800/40 text-slate-300" },
    };
    return colors[key] || { light: "border-slate-300 bg-slate-50 text-slate-700", dark: "border-slate-600/40 bg-slate-800/40 text-slate-300" };
  };

  return (
    <div 
      className={`sticky top-16 z-40 border-b py-3 ${
        darkMode 
          ? "bg-slate-900/95 border-slate-800/60 backdrop-blur-md" 
          : "bg-white/95 border-slate-100 backdrop-blur-md"
      }`}
      data-testid="category-chips"
    >
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar px-4 chip-scroll-container"
      >
        {categoryList.map((cat) => {
          const isActive = activeCategory === cat.key;
          const color = getCategoryColor(cat.key);
          return (
            <button
              key={cat.key}
              data-category={cat.key}
              data-testid={`category-${cat.key}`}
              onClick={() => onCategoryChange(cat.key)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold
                transition-all whitespace-nowrap border
                ${isActive 
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25" 
                  : darkMode ? color.dark : color.light
                }
                ${language === "te" ? "font-telugu" : "tracking-wide"}
              `}
            >
              {language === "en" ? cat.en : cat.te}
            </button>
          );
        })}
      </div>
    </div>
  );
};
