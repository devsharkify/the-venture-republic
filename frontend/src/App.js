import { useState, useEffect, useCallback, createContext } from "react";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { registerServiceWorker, startBreakingNewsPolling, requestNotificationPermission } from "./utils/notifications";

// Components
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { NewsFeed } from "./pages/NewsFeed";
import { SavedArticles } from "./pages/SavedArticles";
import { AdminPanel } from "./pages/AdminPanel";
import { ArticleModal } from "./components/ArticleModal";
import { ShortsPlayer } from "./pages/SwipeReader";
import { VideoNews } from "./pages/VideoNews";
import LiveTV from "./pages/LiveTV";
import { ReporterRegister } from "./pages/ReporterRegister";
import { ReporterDashboard } from "./pages/ReporterDashboard";
import LoginPage from "./pages/LoginPage";
import { AnalyticsDashboard } from "./pages/AnalyticsDashboard";
import ProfilePage from "./pages/ProfilePage";
import EpaperPage from "./pages/EpaperPage";
import ArticlePage from "./pages/ArticlePage";
import AgentsDashboard from "./pages/AgentsDashboard";
import StartupApply from "./pages/StartupApply";
import { VisitorCounter } from "./components/VisitorCounter";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Attach admin phone header automatically on every request made by the logged-in admin.
// Backend routes gated with require_admin read X-Admin-Phone (or admin_phone query param).
axios.interceptors.request.use((config) => {
  const phone = localStorage.getItem("userPhone");
  if (phone) {
    config.headers = config.headers || {};
    config.headers["X-Admin-Phone"] = phone;
  }
  return config;
});

export const AppContext = createContext();

function AppContent() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("preferredLanguage");
    return saved || "en";
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("userPhone"));
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("userPhone") === "7386917770");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [categories, setCategories] = useState({});
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articlesList, setArticlesList] = useState([]);
  const [articleIndex, setArticleIndex] = useState(-1);
  const [savedArticles, setSavedArticles] = useState(() => {
    const saved = localStorage.getItem("savedArticles");
    return saved ? JSON.parse(saved) : [];
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/news/categories`);
        setCategories(response.data.categories);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
  }, [savedArticles]);

  // Breaking news notifications
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
    startBreakingNewsPolling((article) => {
      toast.info(`Breaking: ${article.title}`, { duration: 8000 });
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === "en" ? "te" : "en");
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const handleLoginSuccess = useCallback((userData, isAdminUser) => {
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(isAdminUser || false);
    if (isAdminUser) {
      navigate("/admin");
    } else {
      // Check if reporter exists
      const phone = userData.phone;
      axios.get(`${API}/reporter/check/${phone}`).then(r => {
        if (r.data && r.data.registered && r.data.id) {
          navigate(`/reporter/dashboard/${r.data.id}`);
        } else {
          navigate("/reporter/register");
        }
      }).catch(() => navigate("/reporter/register"));
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("userPhone");
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/");
  }, [navigate]);

  const saveArticle = useCallback((article) => {
    setSavedArticles(prev => {
      const exists = prev.some(a => a.id === article.id);
      if (exists) {
        toast.success(language === "en" ? "Article removed from saved" : "ఆర్టికల్ తొలగించబడింది");
        return prev.filter(a => a.id !== article.id);
      } else {
        toast.success(language === "en" ? "Article saved!" : "ఆర్టికల్ సేవ్ అయింది!");
        return [...prev, article];
      }
    });
  }, [language]);

  const isArticleSaved = useCallback((articleId) => {
    return savedArticles.some(a => a.id === articleId);
  }, [savedArticles]);

  const openArticle = useCallback((article, list = []) => {
    setSelectedArticle(article);
    if (list.length > 0) {
      setArticlesList(list);
      const idx = list.findIndex(a => a.id === article.id);
      setArticleIndex(idx >= 0 ? idx : 0);
    } else {
      setArticlesList([]);
      setArticleIndex(-1);
    }
  }, []);

  const closeArticle = useCallback(() => {
    setSelectedArticle(null);
    setArticlesList([]);
    setArticleIndex(-1);
  }, []);

  const goNextArticle = useCallback(() => {
    if (articlesList.length > 0 && articleIndex < articlesList.length - 1) {
      const next = articleIndex + 1;
      setArticleIndex(next);
      setSelectedArticle(articlesList[next]);
    }
  }, [articlesList, articleIndex]);

  const goPrevArticle = useCallback(() => {
    if (articlesList.length > 0 && articleIndex > 0) {
      const prev = articleIndex - 1;
      setArticleIndex(prev);
      setSelectedArticle(articlesList[prev]);
    }
  }, [articlesList, articleIndex]);

  const contextValue = {
    language, setLanguage, toggleLanguage,
    darkMode, toggleDarkMode,
    categories, savedArticles, saveArticle,
    isArticleSaved, openArticle, closeArticle,
    selectedArticle, articlesList, articleIndex,
    goNextArticle, goPrevArticle,
    user, isLoggedIn, isAdmin, handleLogout
  };

  const isAdminPage = location.pathname === "/admin" || location.pathname === "/analytics" || location.pathname === "/agents";
  const isSwipeMode = false; // Keep header/nav on all pages
  const isReporterPage = location.pathname.startsWith("/reporter");
  const isLoginPage = location.pathname === "/reporter-login";
  const isLivePage = location.pathname === "/live";
  const isEpaperPage = location.pathname === "/epaper";
  const isStartupPage = location.pathname === "/startup-apply";
  const showFloatingLive = !isAdminPage && !isSwipeMode && !isReporterPage && !isLoginPage && !isLivePage && !isEpaperPage && !isStartupPage;

  // Protect admin route
  if (isAdminPage && !isAdmin) {
    return (
      <AppContext.Provider value={contextValue}>
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}>
          <div className="text-center p-8">
            <p className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</p>
            <p className="text-sm text-slate-500 mb-4">Only authorized users can access the admin panel.</p>
            <button onClick={() => navigate("/")} className="text-orange-500 font-medium">Go to Home</button>
          </div>
          <Toaster position="top-center" richColors theme={darkMode ? "dark" : "light"} />
        </div>
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}>
        {!isSwipeMode && !isReporterPage && !isLoginPage && <Header />}
        <main className={`${isAdminPage || isSwipeMode || isReporterPage ? "" : "safe-area-bottom"}`}>
          <Routes>
            <Route path="/" element={<NewsFeed />} />
            <Route path="/swipe" element={<ShortsPlayer />} />
            <Route path="/videos" element={<VideoNews />} />
            <Route path="/live" element={<LiveTV />} />
            <Route path="/saved" element={<SavedArticles />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/reporter/register" element={<ReporterRegister />} />
            <Route path="/reporter/dashboard/:reporterId" element={<ReporterDashboard />} />
            <Route path="/reporter-login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/epaper" element={<EpaperPage />} />
            <Route path="/news/:id" element={<ArticlePage />} />
            <Route path="/agents" element={<AgentsDashboard />} />
            <Route path="/startup-apply" element={<StartupApply />} />
          </Routes>
        </main>
        {!isAdminPage && !isSwipeMode && !isReporterPage && !isLoginPage && <BottomNav />}
        {showFloatingLive && (
          <button
            data-testid="floating-live-btn"
            onClick={() => navigate("/live")}
            className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="text-sm font-bold tracking-wide">LIVE TV</span>
          </button>
        )}
        {showFloatingLive && <VisitorCounter />}
        {!isSwipeMode && <ArticleModal />}
        <Toaster position="top-center" richColors theme={darkMode ? "dark" : "light"} />
      </div>
    </AppContext.Provider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
