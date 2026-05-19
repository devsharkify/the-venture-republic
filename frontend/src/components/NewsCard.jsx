import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { Bookmark, BookmarkCheck, Clock, Share2, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const NewsCard = ({ article, index = 0, articlesList = [] }) => {
  const { language, darkMode, saveArticle, isArticleSaved, openArticle, isAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const isSaved = isArticleSaved(article.id);

  const title = language === "en" ? article.title : (article.title_te || article.title);
  const summary = language === "en" ? article.summary : (article.summary_te || article.summary);
  const categoryLabel = language === "en" 
    ? article.category_label 
    : (article.category_label_te || article.category_label);

  const getTimeAgo = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const getExactTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const mon = months[d.getMonth()];
      const year = d.getFullYear();
      let h = d.getHours();
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      const min = d.getMinutes().toString().padStart(2, "0");
      return `${day} ${mon} ${year}, ${h}:${min} ${ampm}`;
    } catch {
      return "";
    }
  };

  const getCategoryBadgeClass = (category) => {
    const classes = {
      "local": "bg-amber-500",
      "city": "bg-blue-500",
      "state": "bg-purple-500",
      "national": "bg-green-600",
      "international": "bg-rose-500",
      "sports": "bg-emerald-500",
      "entertainment": "bg-violet-500",
      "tech": "bg-indigo-500",
      "health": "bg-teal-500",
      "business": "bg-slate-600"
    };
    return classes[category] || "bg-slate-500";
  };

  const defaultImages = {
    "local": "https://images.pexels.com/photos/17706648/pexels-photo-17706648.jpeg?auto=compress&cs=tinysrgb&w=600",
    "city": "https://images.pexels.com/photos/3573351/pexels-photo-3573351.jpeg?auto=compress&cs=tinysrgb&w=600",
    "state": "https://images.pexels.com/photos/17706648/pexels-photo-17706648.jpeg?auto=compress&cs=tinysrgb&w=600",
    "national": "https://images.pexels.com/photos/17706648/pexels-photo-17706648.jpeg?auto=compress&cs=tinysrgb&w=600",
    "sports": "https://images.pexels.com/photos/31131696/pexels-photo-31131696.jpeg?auto=compress&cs=tinysrgb&w=600",
    "entertainment": "https://images.pexels.com/photos/34818731/pexels-photo-34818731.jpeg?auto=compress&cs=tinysrgb&w=600",
    "tech": "https://images.pexels.com/photos/2777898/pexels-photo-2777898.jpeg?auto=compress&cs=tinysrgb&w=600",
    "health": "https://images.pexels.com/photos/3822688/pexels-photo-3822688.jpeg?auto=compress&cs=tinysrgb&w=600",
    "business": "https://images.pexels.com/photos/6950229/pexels-photo-6950229.jpeg?auto=compress&cs=tinysrgb&w=600",
    "international": "https://images.pexels.com/photos/1098460/pexels-photo-1098460.jpeg?auto=compress&cs=tinysrgb&w=600"
  };

  const imageUrl = article.image || defaultImages[article.category] || defaultImages["national"];

  const handleShare = (e) => {
    e.stopPropagation();
    // Share the branded theventurerepublic.in URL so the unfurl card shows the The Venture Republic domain.
    const shareUrl = `https://www.theventurerepublic.in/news/${article.id}`;
    const shareText = `${title}\n\n${summary.slice(0, 180)}...\n\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title, text: summary?.slice(0, 200), url: shareUrl }).catch(() => {});
      return;
    }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <article 
      data-testid={`news-card-${article.id}`}
      className={`
        news-card rounded-xl overflow-hidden border
        animate-fade-in opacity-0
        stagger-${(index % 5) + 1}
        ${darkMode 
          ? "bg-slate-800 border-slate-700/60" 
          : "bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        }
      `}
      style={{ animationFillMode: "forwards" }}
    >
      {/* Image */}
      <div 
        className="relative aspect-[16/9] cursor-pointer group overflow-hidden"
        onClick={() => openArticle(article, articlesList)}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.src = defaultImages["national"]; }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className={`
          absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider
          ${getCategoryBadgeClass(article.category)}
          ${language === "te" ? "font-telugu normal-case" : ""}
        `}>
          {categoryLabel}
        </div>

        {/* Breaking Badge */}
        {article.is_pinned && (
          <div className="absolute top-3 right-14 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md animate-pulse uppercase tracking-wider">
            {language === "en" ? "Breaking" : "బ్రేకింగ్"}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isAdmin && (
            <button
              data-testid={`admin-edit-${article.id}`}
              onClick={(e) => { e.stopPropagation(); navigate(`/admin?edit=${article.id}`); }}
              className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-blue-500 transition-colors backdrop-blur-sm"
              title="Edit (admin)"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            data-testid={`share-btn-${article.id}`}
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-green-500 transition-colors backdrop-blur-sm"
          >
            <Share2 size={13} />
          </button>
          <button
            data-testid={`save-btn-${article.id}`}
            onClick={(e) => { e.stopPropagation(); saveArticle(article); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
              isSaved 
                ? "bg-orange-500 text-white" 
                : "bg-black/30 text-white hover:bg-orange-500"
            }`}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>

        {/* The Venture Republic Logo Watermark — bottom-right corner */}
        <div className="absolute bottom-2 right-2 pointer-events-none select-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
            <img src="/tvr-logo.png" alt="The Venture Republic" className="h-4 w-auto" />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">The Venture Republic</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 cursor-pointer" onClick={() => openArticle(article)}>
        <h3 className={`
          text-sm font-bold line-clamp-2 mb-2 leading-snug tracking-tight
          ${darkMode ? "text-slate-100" : "text-slate-900"}
          ${language === "te" ? "font-telugu" : ""}
        `}>
          {title}
        </h3>
        
        <p className={`
          text-xs line-clamp-2 mb-3 leading-relaxed
          ${darkMode ? "text-slate-400" : "text-slate-500"}
          ${language === "te" ? "font-telugu" : ""}
        `}>
          {summary}
        </p>

        {/* Time */}
        <div className={`flex items-center gap-1.5 text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          <Clock size={11} />
          <span>{getExactTime(article.published_at)}</span>
          <span className="opacity-60">·</span>
          <span>{getTimeAgo(article.published_at)}</span>
        </div>
      </div>
    </article>
  );
};
