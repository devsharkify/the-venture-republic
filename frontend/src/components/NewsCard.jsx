import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { Bookmark, BookmarkCheck, Clock, Share2, Pencil, ExternalLink } from "lucide-react";

// Source portal URLs for attribution
const SOURCE_URLS = {
  "ET Startups": "https://economictimes.indiatimes.com/small-biz/startups",
  "ET Tech": "https://economictimes.indiatimes.com/tech",
  "ET Markets": "https://economictimes.indiatimes.com/markets",
  "ET Funding": "https://economictimes.indiatimes.com/tech/funding-and-deals",
  "YourStory": "https://yourstory.com",
  "YourStory Funding": "https://yourstory.com/category/funding",
  "Mint": "https://www.livemint.com",
  "Mint Tech": "https://www.livemint.com/technology",
  "Mint Startups": "https://www.livemint.com/companies/start-ups",
  "VCCircle": "https://www.vccircle.com",
  "Entrackr": "https://entrackr.com",
  "Moneycontrol": "https://www.moneycontrol.com",
  "BusinessLine": "https://www.thehindubusinessline.com",
  "Business Standard": "https://www.business-standard.com",
  "Business Standard Tech": "https://www.business-standard.com/technology",
  "NDTV Profit": "https://www.ndtvprofit.com",
  "Financial Express": "https://www.financialexpress.com",
};

const DEFAULT_IMAGES = {
  "funding": "https://images.pexels.com/photos/6950229/pexels-photo-6950229.jpeg?auto=compress&cs=tinysrgb&w=600",
  "startup": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600",
  "vc": "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=600",
  "ipo": "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=600",
  "tech": "https://images.pexels.com/photos/2777898/pexels-photo-2777898.jpeg?auto=compress&cs=tinysrgb&w=600",
  "fintech": "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=600",
  "policy": "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600",
  "business": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600",
};

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

  const readTime = Math.max(1, Math.ceil((article.summary || "").split(/\s+/).filter(Boolean).length / 200));

  // Use published_at (original source date), fallback to created_at
  const getFormattedDate = (article) => {
    try {
      const dateStr = article.published_at || article.created_at;
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };

  const imageUrl = article.image || DEFAULT_IMAGES[article.category] || DEFAULT_IMAGES["startup"];
  const sourcePortalUrl = SOURCE_URLS[article.source] || null;

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `https://www.theventurerepublic.in/news/${article.id}`;
    const shareText = `${title}\n\n${(summary || "").slice(0, 180)}...\n\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title, text: (summary || "").slice(0, 200), url: shareUrl }).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
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
        transition-all duration-200
        ${hovered ? "shadow-md -translate-y-0.5" : "shadow-sm"}
        ${darkMode ? "bg-[#111827] border-slate-800" : "bg-white border-slate-200"}
      `}
      style={{ animationFillMode: "forwards" }}
    >
      {/* Image */}
      <div
        className="relative aspect-[16/9] cursor-pointer overflow-hidden"
        onClick={() => openArticle(article, articlesList)}
      >
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}
          loading="lazy"
          onError={(e) => { e.target.src = DEFAULT_IMAGES["startup"]; }}
        />

        {/* Category pill — bottom-left */}
        {categoryLabel && (
          <span className="absolute bottom-2 left-2 bg-[#0052CC] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none">
            {categoryLabel}
          </span>
        )}

        {/* Breaking badge */}
        {article.is_pinned && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded animate-pulse uppercase tracking-wider">
            Breaking
          </div>
        )}

        {/* Hover actions — top-right */}
        <div className={`absolute top-2 right-2 flex gap-1.5 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/admin?edit=${article.id}`); }}
              className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-[#0052CC] transition-colors"
            >
              <Pencil size={12} />
            </button>
          )}
          <button
            onClick={handleShare}
            className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-[#0052CC] transition-colors"
          >
            <Share2 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); saveArticle(article); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isSaved ? "bg-[#0052CC] text-white" : "bg-black/50 text-white hover:bg-[#0052CC]"
            }`}
          >
            {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 cursor-pointer" onClick={() => openArticle(article)}>
        <h3 className={`
          font-serif-display text-[15px] font-bold line-clamp-2 mb-2 leading-snug
          ${darkMode ? "text-slate-100" : "text-slate-900"}
          ${language === "te" ? "font-telugu" : ""}
        `}>
          {title}
        </h3>

        {/* Source with link + date */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1 text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {sourcePortalUrl ? (
              <a
                href={sourcePortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:text-[#0052CC] transition-colors flex items-center gap-0.5"
              >
                {article.source || "The Venture Republic"}
                <ExternalLink size={9} className="opacity-60" />
              </a>
            ) : (
              <span>{article.source || "The Venture Republic"}</span>
            )}
          </div>

          <div className={`flex items-center gap-1 text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            <Clock size={10} />
            <span>{getFormattedDate(article)}</span>
            <span className="opacity-50">·</span>
            <span>{readTime} min</span>
          </div>
        </div>
      </div>
    </article>
  );
};
