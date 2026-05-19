import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, AppContext } from "../App";
import { CategoryChips } from "../components/CategoryChips";
import { NewsCard } from "../components/NewsCard";
import { Loader2, Newspaper, X, Search, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "../components/ui/button";

const SORT_OPTIONS = [
  { value: "newest", label: "New to Old", label_te: "కొత్త నుండి పాతది" },
  { value: "oldest", label: "Old to New", label_te: "పాత నుండి కొత్తది" },
];

const TIME_FILTERS = [
  { value: "all", label: "All Time", label_te: "అన్ని" },
  { value: "1d", label: "Last 1 Day", label_te: "1 రోజు" },
  { value: "1w", label: "Last 1 Week", label_te: "1 వారం" },
  { value: "1m", label: "Last 1 Month", label_te: "1 నెల" },
  { value: "1y", label: "Last 1 Year", label_te: "1 సంవత్సరం" },
];

// Hero card component — full-width, image left + text right
function HeroCard({ article, darkMode, language }) {
  const { openArticle, isArticleSaved, saveArticle } = useContext(AppContext);
  const isSaved = isArticleSaved(article.id);

  const title = language === "en" ? article.title : (article.title_te || article.title);
  const summary = language === "en" ? article.summary : (article.summary_te || article.summary);
  const categoryLabel = language === "en"
    ? article.category_label
    : (article.category_label_te || article.category_label);

  const defaultImage = "https://images.pexels.com/photos/17706648/pexels-photo-17706648.jpeg?auto=compress&cs=tinysrgb&w=800";
  const imageUrl = article.image || defaultImage;

  return (
    <div
      className={`w-full rounded-xl overflow-hidden border cursor-pointer mb-2 group ${
        darkMode
          ? "bg-[#111827] border-slate-800"
          : "bg-white border-slate-200 shadow-sm"
      }`}
      onClick={() => openArticle(article)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-[55%] aspect-[16/9] md:aspect-auto overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
            onError={(e) => { e.target.src = defaultImage; }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"} ${language === "te" ? "font-telugu normal-case" : ""}`}>
              {categoryLabel}
            </span>
            {article.is_pinned && (
              <span className="ml-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                {language === "en" ? "Breaking" : "బ్రేకింగ్"}
              </span>
            )}
            <h2 className={`font-serif-display text-[20px] md:text-[24px] font-bold leading-snug mt-2 mb-3 ${
              darkMode ? "text-slate-100" : "text-slate-900"
            } ${language === "te" ? "font-telugu" : ""}`}>
              {title}
            </h2>
            <p className={`text-[14px] leading-relaxed line-clamp-3 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            } ${language === "te" ? "font-telugu" : ""}`}>
              {summary}
            </p>
          </div>

          <div className={`flex items-center justify-between mt-4 pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
            <span className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              {article.published_at ? new Date(article.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); saveArticle(article); }}
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved
                  ? "text-[#0052CC]"
                  : darkMode ? "text-slate-500 hover:text-[#0052CC]" : "text-slate-400 hover:text-[#0052CC]"
              }`}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsFeed() {
  const { language, darkMode } = useContext(AppContext);
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);
  const LIMIT = 10;

  const fetchNews = useCallback(async (category, skip = 0, append = false, sort = "newest", time = "all") => {
    try {
      if (skip === 0) setLoading(true);
      else setLoadingMore(true);

      let url = `${API}/news/feed?limit=${LIMIT}&skip=${skip}&sort=${sort}&time_filter=${time}`;
      if (category !== "all") {
        url = `${API}/news/category/${category}?limit=${LIMIT}&skip=${skip}&sort=${sort}&time_filter=${time}`;
      }

      const response = await axios.get(url);
      const newArticles = response.data;

      if (append) setArticles(prev => [...prev, ...newArticles]);
      else setArticles(newArticles);
      setHasMore(newArticles.length === LIMIT);
      setLoading(false);
      setLoadingMore(false);

      // Translate in background if Telugu
      if (language === "te") {
        const untranslated = newArticles.filter(a => !a.title_te || a.title_te.length < 3);
        if (untranslated.length > 0) {
          try {
            const ids = untranslated.map(a => a.id);
            const tr = await axios.post(`${API}/news/translate-batch`, ids);
            const translationMap = {};
            tr.data.forEach(t => { translationMap[t.id] = t; });
            setArticles(prev => prev.map(a => {
              if (translationMap[a.id]) {
                return { ...a, title_te: translationMap[a.id].title_te, summary_te: translationMap[a.id].summary_te };
              }
              return a;
            }));
          } catch (e) {
            console.error("Translation failed:", e);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setLoading(false);
      setLoadingMore(false);
    }
  }, [language]);

  const searchNews = useCallback(async (query, skip = 0, append = false) => {
    if (!query || query.length < 2) return;
    try {
      if (skip === 0) setLoading(true);
      else setLoadingMore(true);
      const response = await axios.get(`${API}/news/search?q=${encodeURIComponent(query)}&limit=${LIMIT}&skip=${skip}`);
      const data = response.data;
      if (append) setArticles(prev => [...prev, ...data.articles]);
      else setArticles(data.articles);
      setSearchTotal(data.total);
      setHasMore(data.articles.length === LIMIT);
    } catch (e) {
      console.error("Search failed:", e);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    if (isSearching && searchQuery.length >= 2) {
      searchNews(searchQuery, 0);
      setPage(0);
    } else if (!isSearching) {
      fetchNews(activeCategory, 0, false, sortBy, timeFilter);
      setPage(0);
    }
  }, [activeCategory, sortBy, timeFilter, language, fetchNews, isSearching, searchQuery, searchNews]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(0);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (isSearching) {
      searchNews(searchQuery, nextPage * LIMIT, true);
    } else {
      fetchNews(activeCategory, nextPage * LIMIT, true, sortBy, timeFilter);
    }
  };

  const handleSearchInput = (value) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.length >= 2) {
      searchTimerRef.current = setTimeout(() => {
        setSearchQuery(value);
        setIsSearching(true);
      }, 400);
    } else if (value.length === 0) {
      setSearchQuery("");
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  };

  const hasActiveFilters = sortBy !== "newest" || timeFilter !== "all";

  return (
    <div data-testid="news-feed-page" className={`min-h-screen pb-20 ${darkMode ? "bg-[#0A0F1C]" : "bg-[#F8F9FA]"}`}>
      {/* Search Bar */}
      <div className={`px-4 pt-3 pb-2 ${darkMode ? "bg-[#0A0F1C]" : "bg-[#F8F9FA]"}`}>
        <div className={`relative flex items-center rounded-lg border transition-all ${
          isSearching
            ? darkMode ? "border-[#0052CC] bg-[#111827]" : "border-[#0052CC] bg-white shadow-sm"
            : darkMode ? "border-slate-700 bg-[#111827]" : "border-slate-300 bg-white"
        }`}>
          <Search size={16} className={`ml-3.5 flex-shrink-0 ${isSearching ? "text-[#0052CC]" : darkMode ? "text-slate-500" : "text-slate-400"}`} />
          <input
            data-testid="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={language === "en" ? "Search articles..." : "వార్తలు శోధించండి..."}
            className={`w-full px-3 py-2 text-sm bg-transparent outline-none ${
              darkMode ? "text-slate-200 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
            }`}
          />
          {searchInput && (
            <button
              data-testid="search-clear-btn"
              onClick={clearSearch}
              className={`mr-3 p-0.5 rounded-full ${darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
            >
              <X size={15} />
            </button>
          )}
        </div>
        {isSearching && (
          <p className={`text-[11px] mt-1.5 ml-1 font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {loading
              ? (language === "en" ? "Searching..." : "శోధిస్తోంది...")
              : (language === "en"
                  ? `${searchTotal} result${searchTotal !== 1 ? "s" : ""} for "${searchQuery}"`
                  : `"${searchQuery}" కోసం ${searchTotal} ఫలితాలు`
                )
            }
          </p>
        )}
      </div>

      <CategoryChips
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="max-w-7xl mx-auto px-4 pt-5">
        {/* Section heading + filter controls */}
        {!isSearching && (
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-[#0052CC] pb-1 ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
              {activeCategory === "all"
                ? (language === "en" ? "Latest Stories" : "తాజా వార్తలు")
                : (language === "en" ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) : activeCategory)
              }
            </h2>

            {/* Subtle inline filter selects */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`text-[11px] font-semibold rounded-lg border px-2 py-1 outline-none transition-all cursor-pointer ${
                  darkMode
                    ? "bg-[#111827] border-slate-700 text-slate-400"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {language === "en" ? opt.label : opt.label_te}
                  </option>
                ))}
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className={`text-[11px] font-semibold rounded-lg border px-2 py-1 outline-none transition-all cursor-pointer ${
                  darkMode
                    ? "bg-[#111827] border-slate-700 text-slate-400"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {TIME_FILTERS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {language === "en" ? opt.label : opt.label_te}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => { setSortBy("newest"); setTimeFilter("all"); }}
                  className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg border transition-all ${
                    darkMode
                      ? "border-slate-700 text-slate-500 hover:text-slate-300"
                      : "border-slate-200 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <X size={10} />
                  {language === "en" ? "Clear" : "తీసేయి"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-[#0052CC] mb-4" />
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"} ${language === "te" ? "font-telugu" : ""}`}>
              {language === "en" ? "Loading news..." : "వార్తలు లోడ్ అవుతున్నాయి..."}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
              <Newspaper size={28} className={darkMode ? "text-slate-600" : "text-slate-300"} />
            </div>
            <h3 className={`text-base font-bold mb-1 tracking-tight ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
              {language === "en" ? "No articles found" : "వార్తలు కనుగొనబడలేదు"}
            </h3>
            <p className={`text-xs text-center max-w-[240px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              {language === "en" ? "Try adjusting your filters or category" : "మీ ఫిల్టర్లు లేదా వర్గాన్ని సర్దుబాటు చేయండి"}
            </p>
          </div>
        )}

        {/* News Grid — Forbes 3-col with hero first article */}
        {!loading && articles.length > 0 && (
          <>
            {/* Hero article: full-width, image left + text right */}
            <HeroCard article={articles[0]} darkMode={darkMode} language={language} />

            {/* Remaining articles: 3-col grid */}
            {articles.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                {articles.slice(1).map((article, index) => (
                  <NewsCard key={article.id} article={article} index={index + 1} articlesList={articles} />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-10 mb-6">
                <Button
                  data-testid="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-[#0052CC] hover:bg-[#003E9E] text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      {language === "en" ? "Loading..." : "లోడ్ అవుతోంది..."}
                    </>
                  ) : (
                    <span className={language === "te" ? "font-telugu" : ""}>
                      {language === "en" ? "Load More" : "మరిన్ని లోడ్ చేయండి"}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { NewsFeed };
