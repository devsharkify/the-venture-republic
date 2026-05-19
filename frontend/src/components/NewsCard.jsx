import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { Bookmark, BookmarkCheck, Clock, Share2, Pencil } from "lucide-react";

export const NewsCard = ({ article, index = 0, articlesList = [] }) => {
  const { language, darkMode, saveArticle, isArticleSaved, openArticle, isAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const isSaved = isArticleSaved(article.id);
  const [hovered, setHovered] = useState(false);

  const title = language === "en" ? article.title : (article.title_te || article.title);
  const summary = language === "en" ? article.summary : (article.summary_te || article.summary);
  const categoryLabel = language === "en"
    ? article.category_label
    : (article.category_label_te || article.category_label);

  // Read time from summary word count
  const readTime = Math.max(1, Math.ceil((article.summary || "").split(/\s+/).filter(Boolean).length / 200));

  const getFormattedDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        news-card rounded-xl overflow-hidden border
        animate-fade-in opacity-0
        stagger-${(index % 5) + 1}
        transition-shadow duration-200
        ${hovered ? "shadow-md" : "shadow-sm"}
        ${darkMode
          ? "bg-[#111827] border-slate-800"
          : "bg-white border-slate-200"
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

        {/* Category pill badge — bottom-left of image */}
        {categoryLabel && (
          <span className="absolute bottom-2 left-2 bg-[#0052CC] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none">
            {categoryLabel}
          </span>
        )}

        {/* Breaking Badge */}
        {article.is_pinned && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md animate-pulse uppercase tracking-wider">
            {language === "en" ? "Breaking" : "బ్రేకింగ్"}
          </div>
        )}

        {/* Action Buttons — visible on hover */}
        <div className={`absolute top-3 right-3 flex gap-2 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
          {isAdmin && (
            <button
              data-testid={`admin-edit-${article.id}`}
              onClick={(e) => { e.stopPropagation(); navigate(`/admin?edit=${article.id}`); }}
              className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-[#0052CC] transition-colors backdrop-blur-sm"
              title="Edit (admin)"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            data-testid={`share-btn-${article.id}`}
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-[#0052CC] transition-colors backdrop-blur-sm"
          >
            <Share2 size={13} />
          </button>
          <button
            data-testid={`save-btn-${article.id}`}
            onClick={(e) => { e.stopPropagation(); saveArticle(article); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
              isSaved
                ? "bg-[#0052CC] text-white"
                : "bg-black/40 text-white hover:bg-[#0052CC]"
            }`}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 cursor-pointer" onClick={() => openArticle(article)}>
        <h3 className={`
          font-serif-display text-[15px] font-bold line-clamp-2 mt-1 mb-1.5 leading-snug
          ${darkMode ? "text-slate-100" : "text-slate-900"}
          ${language === "te" ? "font-telugu" : ""}
        `}>
          {title}
        </h3>

        {/* Author line */}
        <p className={`text-[11px] mb-2 ${darkMode ? "text-slate-500" : "text-slate-400"} ${language === "te" ? "font-telugu" : ""}`}>
          By {article.source || "The Venture Republic"}
        </p>

        {/* Date + read time */}
        <div className={`flex items-center gap-1.5 text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          <Clock size={11} />
          <span>{getFormattedDate(article.created_at)}</span>
          <span className="opacity-60">·</span>
          <span>{readTime} min read</span>
        </div>
      </div>
    </article>
  );
};
