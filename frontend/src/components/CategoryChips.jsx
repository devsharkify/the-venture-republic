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
      const activeChip = scrollRef.current.querySelector(
        `[data-category="${activeCategory}"]`
      );
      if (activeChip) {
        activeChip.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });
      }
    }
  }, [activeCategory]);

  return (
    <div
      className={`sticky top-[88px] z-40 ${
        darkMode ? "bg-[#0A0F1C]" : "bg-white"
      }`}
      data-testid="category-chips"
    >
      {/* 2px brand-blue rule across the top of the nav strip */}
      <div className="h-[2px] bg-[#0F172A]" />

      {/* Scrollable tab row */}
      <div
        ref={scrollRef}
        className={`
          flex overflow-x-auto hide-scrollbar
          px-4 md:px-6
          max-w-screen-xl md:mx-auto
          chip-scroll-container
        `}
      >
        {categoryList.map((cat, index) => {
          const isActive = activeCategory === cat.key;
          const isTelugu = language === "te";
          const label = isTelugu ? cat.te : cat.en;
          const isLast = index === categoryList.length - 1;

          return (
            <div
              key={cat.key}
              className="flex items-stretch flex-shrink-0"
            >
              {/* Tab button */}
              <button
                data-category={cat.key}
                data-testid={`category-${cat.key}`}
                onClick={() => onCategoryChange(cat.key)}
                className={`
                  relative flex-shrink-0
                  px-4 pt-[10px] pb-[9px]
                  transition-colors duration-150
                  whitespace-nowrap
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-1
                  ${isTelugu
                    ? "font-telugu normal-case text-[13px] font-semibold tracking-normal"
                    : "text-[11px] font-bold uppercase tracking-[0.16em]"
                  }
                  ${isActive
                    ? "text-[#0F172A]"
                    : darkMode
                      ? "text-slate-500 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }
                `}
              >
                {label}

                {/* Active indicator: 3px bar anchored to the bottom of the tab */}
                <span
                  className={`
                    absolute bottom-0 left-0 right-0 h-[3px]
                    transition-opacity duration-150
                    bg-[#0F172A]
                    ${isActive ? "opacity-100" : "opacity-0"}
                  `}
                />
              </button>

              {/* Desktop-only mid-dot separator between items */}
              {!isLast && (
                <span
                  className={`
                    hidden md:flex items-center
                    select-none pointer-events-none
                    text-[10px] px-0
                    ${darkMode ? "text-slate-700" : "text-slate-300"}
                  `}
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom divider */}
      <div
        className={`h-px ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}
      />
    </div>
  );
};
