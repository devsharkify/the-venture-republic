import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API, AppContext } from "../App";
import { Clock, ArrowLeft, Share2 } from "lucide-react";

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, darkMode } = useContext(AppContext);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/news/article/${id}`).then(res => {
      setArticle(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const title = article ? (language === "en" ? article.title : (article.title_te || article.title)) : "";
  const summary = article ? (language === "en" ? article.summary : (article.summary_te || article.summary)) : "";
  const category = article ? (language === "en" ? article.category_label : (article.category_label_te || article.category_label)) : "";
  const shareUrl = `https://www.theventurerepublic.in/news/${id}`;

  useEffect(() => {
    if (title) document.title = `${title} - The Venture Republic`;
    return () => { document.title = "The Venture Republic"; };
  }, [title]);

  // Show original publication date from the scraped source
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
      <div className="animate-spin w-8 h-8 border-2 border-[#0052CC] border-t-transparent rounded-full" />
    </div>
  );

  if (!article) return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${darkMode ? "bg-slate-900 text-white" : "bg-[#F8FAFC]"}`}>
      <p>Article not found</p>
      <button onClick={() => navigate("/")} className="text-[#0052CC]">Go Home</button>
    </div>
  );

  const publishedTime = getPublishedTime(article);

  return (
    <div data-testid="article-page" className={`min-h-screen pb-20 ${darkMode ? "bg-slate-900" : "bg-[#F8FAFC]"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b ${darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-100"} backdrop-blur`}>
        <button data-testid="article-back-btn" onClick={() => navigate(-1)} className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
          <ArrowLeft size={20} />
        </button>
        <span className={`text-sm font-semibold flex-1 truncate ${darkMode ? "text-white" : "text-slate-800"}`}>The Venture Republic</span>
        <button data-testid="article-share-btn" onClick={handleShare} className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
          <Share2 size={18} />
        </button>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-5">
        {/* Category + Published date from original source */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#0052CC] text-white rounded">
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
      </article>
    </div>
  );
}
