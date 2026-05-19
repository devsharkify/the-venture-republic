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

  return (
    <div
      className={`sticky top-16 z-40 border-b ${
        darkMode
          ? "bg-[#0A0F1C] border-slate-800"
          : "bg-white border-slate-200"
      }`}
      data-testid="category-chips"
    >
      <div
        ref={scrollRef}
        className="flex gap-0 overflow-x-auto hide-scrollbar px-4 chip-scroll-container"
      >
        {categoryList.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              data-category={cat.key}
              data-testid={`category-${cat.key}`}
              onClick={() => onCategoryChange(cat.key)}
              className={`
                flex-shrink-0 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em]
                border-b-2 transition-all whitespace-nowrap
                ${isActive
                  ? "border-[#0052CC] text-[#0052CC]"
                  : darkMode
                    ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }
                ${language === "te" ? "font-telugu normal-case" : ""}
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
