import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { Bookmark, BookmarkCheck, Clock, Share2, Pencil } from "lucide-react";

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
    const shareUrl = `https://www.theventurerepublic.in/news/${article.slug || article.id}`;
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
          <span className="absolute bottom-2 left-2 bg-[#0F172A] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none">
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
              className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-[#0F172A] transition-colors"
            >
              <Pencil size={12} />
            </button>
          )}
          <button
            onClick={handleShare}
            className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-[#0F172A] transition-colors"
          >
            <Share2 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); saveArticle(article); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isSaved ? "bg-[#0F172A] text-white" : "bg-black/50 text-white hover:bg-[#0F172A]"
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

        {/* Date + read time + WhatsApp share */}
        <div className={`flex items-center gap-1.5 text-[11px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          <Clock size={10} />
          <span>{getFormattedDate(article)}</span>
          <span className="opacity-40">·</span>
          <span>{readTime} min read</span>
          <span className="flex-1" />
          <a
            href={`https://wa.me/?text=${encodeURIComponent((title || '') + ' - https://www.theventurerepublic.in/news/' + (article.slug || article.id))}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity flex-shrink-0"
            title="Share on WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
};
