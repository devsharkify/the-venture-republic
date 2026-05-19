import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, AppContext } from "../App";
import { CategoryChips } from "../components/CategoryChips";
import { NewsCard } from "../components/NewsCard";
import { Loader2, RefreshCw, Newspaper, SlidersHorizontal, ArrowUpDown, Clock, X, Search, Mic, ArrowRight, Rocket } from "lucide-react";
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
  const [showFilters, setShowFilters] = useState(false);
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

      // Show articles immediately
      if (append) setArticles(prev => [...prev, ...newArticles]);
      else setArticles(newArticles);
      setHasMore(newArticles.length === LIMIT);
      setLoading(false);
      setLoadingMore(false);

      // Then translate in background if Telugu
      if (language === "te") {
        const untranslated = newArticles.filter(a => !a.title_te || a.title_te.length < 3);
        if (untranslated.length > 0) {
          try {
            const ids = untranslated.map(a => a.id);
            const tr = await axios.post(`${API}/news/translate-batch`, ids);
            const translationMap = {};
            tr.data.forEach(t => { translationMap[t.id] = t; });
            // Update articles with translations
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

  // Search function
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

  const handleRefresh = () => {
    setPage(0);
    fetchNews(activeCategory, 0, false, sortBy, timeFilter);
  };

  const hasActiveFilters = sortBy !== "newest" || timeFilter !== "all";

  return (
    <div data-testid="news-feed-page" className={`min-h-screen pb-20 ${darkMode ? "bg-slate-900" : "bg-[#F8FAFC]"}`}>
      {/* Search Bar */}
      <div className={`px-4 pt-3 pb-1 ${darkMode ? "bg-slate-900" : "bg-[#F8FAFC]"}`}>
        <div className={`relative flex items-center rounded-xl border transition-all ${
          isSearching
            ? darkMode ? "border-orange-500/60 bg-slate-800 shadow-sm shadow-orange-500/10" : "border-orange-400 bg-white shadow-sm shadow-orange-500/10"
            : darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-white"
        }`}>
          <Search size={16} className={`ml-3.5 flex-shrink-0 ${isSearching ? "text-orange-500" : darkMode ? "text-slate-500" : "text-slate-400"}`} />
          <input
            data-testid="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={language === "en" ? "Search articles..." : "వార్తలు శోధించండి..."}
            className={`w-full px-3 py-2.5 text-sm bg-transparent outline-none ${
              darkMode ? "text-slate-200 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
            }`}
          />
          {searchInput && (
            <button data-testid="search-clear-btn" onClick={clearSearch} className={`mr-3 p-0.5 rounded-full ${darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}>
              <X size={15} />
            </button>
          )}
        </div>
        {isSearching && (
          <p className={`text-[11px] mt-1.5 ml-1 font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {loading ? (language === "en" ? "Searching..." : "శోధిస్తోంది...") : (
              language === "en" ? `${searchTotal} result${searchTotal !== 1 ? "s" : ""} for "${searchQuery}"` : `"${searchQuery}" కోసం ${searchTotal} ఫలితాలు`
            )}
          </p>
        )}
      </div>

      <CategoryChips 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
      />

      {/* Become a Reporter + Apply for Funding CTAs — always visible, side-by-side */}
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            data-testid="join-reporter-cta"
            onClick={() => navigate("/reporter/register")}
            className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all ${
              darkMode
                ? "bg-slate-800 border-slate-700 hover:border-orange-500 hover:bg-slate-800"
                : "bg-white border-slate-200 hover:border-orange-400 hover:shadow-sm"
            }`}
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-slate-700 text-orange-400" : "bg-orange-50 text-orange-600"}`}>
              <Mic size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`font-semibold text-[12px] sm:text-sm leading-tight ${darkMode ? "text-white" : "text-slate-900"} ${language === "te" ? "font-telugu" : ""}`}>
                {language === "en" ? "Become a Reporter" : "రిపోర్టర్ అవ్వండి"}
              </p>
              <p className={`hidden sm:block text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"} ${language === "te" ? "font-telugu" : ""} truncate`}>
                {language === "en" ? "Share local news. Free to join." : "మీ ప్రాంత వార్తలను పంచుకోండి"}
              </p>
            </div>
            <ArrowRight size={14} className={`hidden sm:block flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
          </button>

          <button
            data-testid="apply-startup-cta"
            onClick={() => navigate("/startup-apply")}
            className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all ${
              darkMode
                ? "bg-slate-800 border-slate-700 hover:border-orange-500 hover:bg-slate-800"
                : "bg-white border-slate-200 hover:border-orange-400 hover:shadow-sm"
            }`}
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? "bg-slate-700 text-orange-400" : "bg-orange-50 text-orange-600"}`}>
              <Rocket size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`font-semibold text-[12px] sm:text-sm leading-tight ${darkMode ? "text-white" : "text-slate-900"} ${language === "te" ? "font-telugu" : ""}`}>
                {language === "en" ? "Apply for Startup Funding" : "స్టార్టప్ ఫండింగ్"}
              </p>
              <p className={`hidden sm:block text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"} ${language === "te" ? "font-telugu" : ""} truncate`}>
                {language === "en" ? "Hyderabad's Next 100 Startups." : "హైదరాబాద్ తదుపరి 100 స్టార్టప్‌లు"}
              </p>
            </div>
            <ArrowRight size={14} className={`hidden sm:block flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <button
            data-testid="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
              showFilters || hasActiveFilters
                ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                : darkMode
                  ? "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <SlidersHorizontal size={13} />
            {language === "en" ? "Filters" : "ఫిల్టర్లు"}
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>
          <button
            data-testid="refresh-feed-btn"
            onClick={handleRefresh}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {language === "en" ? "Refresh" : "రిఫ్రెష్"}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div 
            data-testid="filter-panel" 
            className={`rounded-xl p-4 mb-5 space-y-4 border ${
              darkMode 
                ? "bg-slate-800/60 border-slate-700/60 backdrop-blur-sm" 
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {language === "en" ? "Sort & Filter" : "సార్ట్ & ఫిల్టర్"}
              </span>
              {hasActiveFilters && (
                <button 
                  onClick={() => { setSortBy("newest"); setTimeFilter("all"); }}
                  className="text-[10px] font-semibold text-orange-500 hover:text-orange-600"
                >
                  {language === "en" ? "Clear all" : "అన్నీ తీసేయి"}
                </button>
              )}
            </div>

            {/* Sort */}
            <div>
              <p className={`text-[10px] font-semibold mb-2 uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                <ArrowUpDown size={10} />
                {language === "en" ? "Sort Order" : "క్రమం"}
              </p>
              <div className="flex gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    data-testid={`sort-${opt.value}`}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      sortBy === opt.value
                        ? "bg-orange-500 text-white border-orange-500"
                        : darkMode
                          ? "border-slate-700 text-slate-400 hover:border-slate-600"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {language === "en" ? opt.label : opt.label_te}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <p className={`text-[10px] font-semibold mb-2 uppercase tracking-widest flex items-center gap-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                <Clock size={10} />
                {language === "en" ? "Time Range" : "సమయ పరిధి"}
              </p>
              <div className="flex flex-wrap gap-2">
                {TIME_FILTERS.map(opt => (
                  <button
                    key={opt.value}
                    data-testid={`time-${opt.value}`}
                    onClick={() => setTimeFilter(opt.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      timeFilter === opt.value
                        ? "bg-orange-500 text-white border-orange-500"
                        : darkMode
                          ? "border-slate-700 text-slate-400 hover:border-slate-600"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {language === "en" ? opt.label : opt.label_te}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {sortBy !== "newest" && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                darkMode ? "bg-slate-800 text-orange-400 border border-slate-700" : "bg-orange-50 text-orange-600 border border-orange-200"
              }`}>
                <ArrowUpDown size={10} />
                {SORT_OPTIONS.find(o => o.value === sortBy)?.[language === "en" ? "label" : "label_te"]}
                <button onClick={() => setSortBy("newest")} className="ml-0.5 hover:text-red-500"><X size={11} /></button>
              </span>
            )}
            {timeFilter !== "all" && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                darkMode ? "bg-slate-800 text-orange-400 border border-slate-700" : "bg-orange-50 text-orange-600 border border-orange-200"
              }`}>
                <Clock size={10} />
                {TIME_FILTERS.find(o => o.value === timeFilter)?.[language === "en" ? "label" : "label_te"]}
                <button onClick={() => setTimeFilter("all")} className="ml-0.5 hover:text-red-500"><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-orange-500 mb-4" />
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

        {/* News Grid */}
        {!loading && articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article, index) => (
                <NewsCard key={article.id} article={article} index={index} articlesList={articles} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10 mb-6">
                <Button
                  data-testid="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 shadow-sm shadow-orange-500/20"
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
