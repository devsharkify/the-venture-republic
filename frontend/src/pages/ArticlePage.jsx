import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API, AppContext } from "../App";
import { Clock, ArrowLeft, Share2 } from "lucide-react";

const DEFAULT_IMAGES = {
  funding: "https://images.pexels.com/photos/6950229/pexels-photo-6950229.jpeg?auto=compress&cs=tinysrgb&w=400",
  startup: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400",
  vc: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=400",
  ipo: "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400",
  tech: "https://images.pexels.com/photos/2777898/pexels-photo-2777898.jpeg?auto=compress&cs=tinysrgb&w=400",
  fintech: "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=400",
  policy: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400",
  business: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
};

function getImage(article) {
  return article.image || DEFAULT_IMAGES[article.category] || DEFAULT_IMAGES.startup;
}

function formatShortDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

// Sidebar card — compact horizontal layout
function SidebarArticleCard({ article, darkMode, onClick }) {
  const title = article.title || "";
  const img = getImage(article);
  const catLabel = article.category_label || "";
  return (
    <div
      onClick={() => onClick(article)}
      className={`flex gap-2.5 cursor-pointer group rounded-lg p-2 -mx-2 transition-colors ${
        darkMode ? "hover:bg-slate-800/60" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex-shrink-0 w-[76px] h-[58px] rounded-md overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => { e.target.src = DEFAULT_IMAGES.startup; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        {catLabel && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#0F172A] block mb-0.5">{catLabel}</span>
        )}
        <p className={`text-[12px] font-semibold leading-snug line-clamp-2 ${
          darkMode ? "text-slate-200" : "text-slate-800"
        }`}>{title}</p>
        <span className={`text-[10px] mt-0.5 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          {formatShortDate(article.published_at || article.created_at)}
        </span>
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, darkMode, openArticle } = useContext(AppContext);
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/news/article/${id}`).then(res => {
      setArticle(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Load related (same category) + latest articles for sidebars
  useEffect(() => {
    if (!article) return;
    // Related: same category, exclude current
    axios.get(`${API}/news/category/${article.category}?limit=6`).then(res => {
      const items = (res.data.articles || res.data || []).filter(a => (a.id || a._id) !== id).slice(0, 5);
      setRelatedArticles(items);
    }).catch(() => {});
    // Latest: newest articles
    axios.get(`${API}/news?limit=6`).then(res => {
      const items = (res.data.articles || res.data || []).filter(a => (a.id || a._id) !== id).slice(0, 5);
      setLatestArticles(items);
    }).catch(() => {});
  }, [article, id]);

  const title = article ? (language === "en" ? article.title : (article.title_te || article.title)) : "";
  const summary = article ? (language === "en" ? article.summary : (article.summary_te || article.summary)) : "";
  const category = article ? (language === "en" ? article.category_label : (article.category_label_te || article.category_label)) : "";
  const shareUrl = `https://www.theventurerepublic.in/news/${id}`;

  useEffect(() => {
    if (title) document.title = `${title} - The Venture Republic`;
    return () => { document.title = "The Venture Republic"; };
  }, [title]);

  const getPublishedTime = (article) => {
    try {
      const dateStr = article.published_at || article.article_published_time || article.created_at;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      let h = d.getHours();
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${d.getMinutes().toString().padStart(2,"0")} ${ampm}`;
    } catch { return ""; }
  };

  const handleShare = () => {
    const text = `${title}\n\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title, text: summary?.slice(0, 200), url: shareUrl }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-slate-900" : "bg-[#F8FAFC]"}`}>
      <div className="animate-spin w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full" />
    </div>
  );

  if (!article) return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${darkMode ? "bg-slate-900 text-white" : "bg-[#F8FAFC]"}`}>
      <p>Article not found</p>
      <button onClick={() => navigate("/")} className="text-[#0F172A]">Go Home</button>
    </div>
  );

  const publishedTime = getPublishedTime(article);

  return (
    <div data-testid="article-page" className={`min-h-screen pb-10 ${darkMode ? "bg-slate-900" : "bg-[#F8FAFC]"}`}>
      {/* Sticky top bar */}
      <div className={`sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b ${darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-100"} backdrop-blur`}>
        <button data-testid="article-back-btn" onClick={() => navigate(-1)} className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
          <ArrowLeft size={20} />
        </button>
        <span className={`text-sm font-semibold flex-1 truncate ${darkMode ? "text-white" : "text-slate-800"}`}>The Venture Republic</span>
        <button data-testid="article-share-btn" onClick={handleShare} className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
          <Share2 size={18} />
        </button>
      </div>

      {/* 3-column layout on lg screens */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[260px_1fr_260px] lg:gap-8">

        {/* ── LEFT SIDEBAR: Related Articles ── */}
        <aside className="hidden lg:block">
          <div className={`sticky top-20 rounded-xl p-4 ${darkMode ? "bg-[#111827] border border-slate-800" : "bg-white border border-slate-200"}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.18em] pb-2 mb-3 border-b-2 border-[#0F172A] ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              Related Stories
            </h3>
            <div className="flex flex-col gap-3">
              {relatedArticles.length > 0 ? relatedArticles.map(a => (
                <SidebarArticleCard
                  key={a.id || a._id}
                  article={a}
                  darkMode={darkMode}
                  onClick={(art) => openArticle(art)}
                />
              )) : (
                <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Loading…</p>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN ARTICLE ── */}
        <article className="min-w-0">
          {/* Category + date */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#0F172A] text-white rounded">
              {category}
            </span>
            {publishedTime && (
              <span className={`flex items-center gap-1 text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                <Clock size={11} />
                {publishedTime}
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className={`text-2xl sm:text-3xl font-serif-display font-bold leading-tight mb-5 ${darkMode ? "text-white" : "text-slate-900"}`}>
            {title}
          </h1>

          {/* Hero image */}
          {article.image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={article.image}
                alt={title}
                className="w-full max-h-[420px] object-cover"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          {/* Body */}
          <div className={`text-base leading-relaxed whitespace-pre-line ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
            {summary}
          </div>

          {/* Mobile: show related articles below body */}
          {relatedArticles.length > 0 && (
            <div className="lg:hidden mt-8">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.18em] pb-2 mb-3 border-b-2 border-[#0F172A] ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                Related Stories
              </h3>
              <div className="flex flex-col gap-3">
                {relatedArticles.map(a => (
                  <SidebarArticleCard key={a.id || a._id} article={a} darkMode={darkMode} onClick={(art) => openArticle(art)} />
                ))}
              </div>
            </div>
          )}
        </article>

        {/* ── RIGHT SIDEBAR: Latest News ── */}
        <aside className="hidden lg:block">
          <div className={`sticky top-20 rounded-xl p-4 ${darkMode ? "bg-[#111827] border border-slate-800" : "bg-white border border-slate-200"}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.18em] pb-2 mb-3 border-b-2 border-[#0F172A] ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              Latest News
            </h3>
            <div className="flex flex-col gap-3">
              {latestArticles.length > 0 ? latestArticles.map(a => (
                <SidebarArticleCard
                  key={a.id || a._id}
                  article={a}
                  darkMode={darkMode}
                  onClick={(art) => openArticle(art)}
                />
              )) : (
                <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Loading…</p>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
