from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
import asyncio
import uuid
import httpx
from bs4 import BeautifulSoup
from database import db, logger, EMERGENT_LLM_KEY, CATEGORIES
from helpers import classify_article_category, guess_category_from_url, extract_seo_and_text, generate_ai_summary, translate_to_telugu, translate_to_english, ensure_min_paragraphs, expand_summary_with_ai

router = APIRouter(prefix="/api")

scraper_status = {"running": False, "last_run": None, "articles_added": 0, "error": None}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

DC_CATEGORY_MAP = {"southern-states": "state", "telangana": "state", "andhra-pradesh": "state", "karnataka": "state", "nation": "national", "world": "international", "americas": "international", "asia": "international", "sports": "sports", "business": "business", "entertainment": "entertainment", "technology": "tech", "health": "health", "market": "business", "economics": "business"}
EENADU_CATEGORY_MAP = {"sports": "sports", "movies": "entertainment", "business": "business", "india": "national", "world": "international", "crime": "city", "women": "entertainment", "telangana": "state", "andhra-pradesh": "state", "health": "health", "technology": "tech", "education": "national"}
TOI_CATEGORY_MAP = {"india": "national", "world": "international", "business": "business", "sports": "sports", "entertainment": "entertainment", "technology": "tech", "life-style": "entertainment", "education": "national", "city": "city", "defence": "national"}
SIASAT_CATEGORY_MAP = {"hyderabad": "city", "telangana": "state", "andhra-pradesh": "state", "india": "national", "national": "national", "middle-east": "international", "world": "international", "international": "international", "technology": "tech", "technology-2": "tech", "entertainment": "entertainment", "sports": "sports", "business": "business", "health": "health"}


def cat_from_url(url, cat_map):
    url_lower = url.lower()
    for key, cat in cat_map.items():
        if f"/{key}/" in url_lower or f"/{key}" in url_lower:
            return cat
    return ""


async def save_article(article, source):
    existing = await db.news.find_one({"link": article["link"]}, {"_id": 0, "id": 1})
    if existing:
        return False
    seo, full_text = {}, ""
    try:
        seo, full_text = await extract_seo_and_text(article["link"], HEADERS)
    except Exception:
        pass
    if not article.get("image") and seo.get("og_image"):
        article["image"] = seo["og_image"]
    elif seo.get("og_image"):
        # Always prefer og_image from the article page — scraper homepage images are unreliable
        article["image"] = seo["og_image"]
    summary = await generate_ai_summary(full_text, article["link"])
    if summary:
        article["summary"] = summary
    elif not article.get("summary") or article["summary"] == article.get("title"):
        article["summary"] = seo.get("og_description") or seo.get("seo_description") or (full_text[:500] if full_text else article.get("title", ""))
    # Enforce 4+ paragraph minimum: format what we have, expand via AI if still too thin
    article["summary"] = ensure_min_paragraphs(article.get("summary", ""), min_paragraphs=4)
    para_count = len([p for p in (article["summary"] or "").split("\n\n") if p.strip()])
    if para_count < 4 and (full_text or article.get("summary")):
        expanded = await expand_summary_with_ai(article["summary"], full_text or "", min_paragraphs=4)
        if expanded:
            article["summary"] = ensure_min_paragraphs(expanded, min_paragraphs=4)
    cat = article.get("category") or ""
    if not cat:
        cat = await classify_article_category(article.get("title", ""), article.get("summary", ""))
    is_telugu = article.get("_telugu", False)
    news = {
        "id": str(uuid.uuid4()),
        "title": "" if is_telugu else article.get("title", "")[:200],
        "title_te": article.get("title", "")[:200] if is_telugu else "",
        "summary": "" if is_telugu else article.get("summary", ""),
        "summary_te": article.get("summary", "") if is_telugu else "",
        "category": cat,
        "category_label": CATEGORIES.get(cat, {}).get("en", cat),
        "category_label_te": CATEGORIES.get(cat, {}).get("te", cat),
        "image": article.get("image", ""),
        "video_url": "", "content_type": "text",
        "link": article["link"], "is_pinned": False, "priority": 5, "is_active": True,
        "source": source,
        "seo_description": seo.get("seo_description", ""), "seo_keywords": seo.get("seo_keywords", []),
        "seo_author": seo.get("seo_author", ""), "og_title": seo.get("og_title", ""),
        "og_description": seo.get("og_description", ""), "og_image": seo.get("og_image", ""),
        "article_published_time": seo.get("article_published_time", ""),
        "published_at": seo.get("article_published_time") or datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.news.insert_one(news)
    # Auto-translate: English→Telugu or Telugu→English
    try:
        if is_telugu and not news["title"]:
            en_title = await translate_to_english(news["title_te"])
            en_summary = await translate_to_english(news["summary_te"])
            if en_title:
                await db.news.update_one({"id": news["id"]}, {"$set": {"title": en_title, "summary": en_summary or ""}})
        elif not is_telugu and not news["title_te"]:
            te_title = await translate_to_telugu(news["title"])
            te_summary = await translate_to_telugu(news["summary"])
            if te_title:
                await db.news.update_one({"id": news["id"]}, {"$set": {"title_te": te_title, "summary_te": te_summary or ""}})
    except Exception as e:
        logger.error(f"Auto-translate failed for {news['id']}: {e}")
    return news["id"]


# ===== SIASAT.COM SCRAPER =====
async def scrape_siasat():
    added = 0
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as http:
            resp = await http.get("https://www.siasat.com/", headers=HEADERS)
            resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        articles = []
        for h2 in soup.find_all('h2'):
            a = h2.find('a')
            if not a or not a.get('href'):
                continue
            link = a['href']
            if not link.startswith('http'):
                link = f"https://www.siasat.com/{link.lstrip('/')}"
            title = a.get_text(strip=True)
            if not title or 'siasat.com' not in link:
                continue
            if any(x['link'] == link for x in articles):
                continue
            image = ""
            parent = h2.parent
            if parent:
                img = parent.find('img')
                if img:
                    image = img.get('data-src') or img.get('data-lazy-src') or img.get('src') or ""
                    if image:
                        image = image.replace('-220x150', '-390x220').replace('-80x80', '-390x220')
            summary = ""
            if parent:
                p = parent.find('p')
                if p:
                    summary = p.get_text(strip=True)
            articles.append({"link": link, "title": title[:200], "summary": summary or title, "image": image, "category": cat_from_url(link, SIASAT_CATEGORY_MAP)})
        for a in articles[:30]:
            if await save_article(a, "siasat.com"):
                added += 1
    except Exception as e:
        logger.error(f"Siasat scraper error: {e}")
    return added


# ===== DECCAN CHRONICLE SCRAPER =====
async def scrape_deccan_chronicle():
    added = 0
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as http:
            resp = await http.get("https://www.deccanchronicle.com/", headers=HEADERS)
            resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        articles = []
        for tag in soup.find_all(['h2', 'h5']):
            a = tag.find('a')
            if not a or not a.get('href'):
                continue
            link = a['href']
            if not link.startswith('http'):
                link = f"https://www.deccanchronicle.com{link}"
            title = a.get_text(strip=True)
            if not title or 'deccanchronicle.com' not in link or len(title) < 10:
                continue
            if any(x['link'] == link for x in articles):
                continue
            image = ""
            parent = tag.parent
            if parent:
                img = parent.find('img')
                if not img:
                    img = parent.find_previous('img')
                if img:
                    src = img.get('data-src') or img.get('src') or ""
                    if src and 'placeholder' not in src:
                        image = src if src.startswith('http') else f"https://www.deccanchronicle.com{src}"
            articles.append({"link": link, "title": title[:200], "summary": title, "image": image, "category": cat_from_url(link, DC_CATEGORY_MAP)})
        for a in articles[:30]:
            if await save_article(a, "deccanchronicle.com"):
                added += 1
    except Exception as e:
        logger.error(f"Deccan Chronicle scraper error: {e}")
    return added


# ===== TIMES OF INDIA SCRAPER =====
async def scrape_toi():
    added = 0
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as http:
            resp = await http.get("https://timesofindia.indiatimes.com/", headers=HEADERS)
            resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        articles = []
        for a_tag in soup.find_all('a', href=True):
            link = a_tag['href']
            if '/articleshow/' not in link:
                continue
            if not link.startswith('http'):
                link = f"https://timesofindia.indiatimes.com{link}"
            title = a_tag.get_text(strip=True)
            if not title or len(title) < 15 or 'indiatimes.com' not in link:
                continue
            if any(x['link'] == link for x in articles):
                continue
            image = ""
            img = a_tag.find('img')
            if not img:
                parent = a_tag.parent
                if parent:
                    img = parent.find('img')
            if img:
                image = img.get('data-src') or img.get('src') or ""
                if image and not image.startswith('http'):
                    image = ""
            articles.append({"link": link, "title": title[:200], "summary": title, "image": image, "category": cat_from_url(link, TOI_CATEGORY_MAP)})
        for a in articles[:30]:
            if await save_article(a, "timesofindia.com"):
                added += 1
    except Exception as e:
        logger.error(f"TOI scraper error: {e}")
    return added


# ===== EENADU TELUGU SCRAPER =====
async def scrape_eenadu():
    added = 0
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as http:
            resp = await http.get("https://www.eenadu.net/", headers=HEADERS)
            resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        articles = []
        for a_tag in soup.find_all('a', href=True):
            link = a_tag['href']
            if '/telugu-news/' not in link and '/telugu-article/' not in link:
                continue
            if not link.startswith('http'):
                link = f"https://www.eenadu.net{link}"
            title = a_tag.get_text(strip=True)
            if not title or len(title) < 5 or 'eenadu.net' not in link:
                continue
            if any(x['link'] == link for x in articles):
                continue
            image = ""
            img = a_tag.find('img')
            if not img:
                parent = a_tag.parent
                if parent:
                    img = parent.find('img')
            if img:
                image = img.get('data-src') or img.get('src') or ""
                if image and not image.startswith('http'):
                    image = ""
            articles.append({"link": link, "title": title[:200], "summary": title, "image": image, "category": cat_from_url(link, EENADU_CATEGORY_MAP), "_telugu": True})
        for a in articles[:30]:
            if await save_article(a, "eenadu.net"):
                added += 1
    except Exception as e:
        logger.error(f"Eenadu scraper error: {e}")
    return added


# ===== WAY2NEWS TELUGU SCRAPER =====
async def scrape_way2news():
    added = 0
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as http:
            resp = await http.get("https://telugu.way2news.com/", headers=HEADERS)
            resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        articles = []
        for h1 in soup.find_all('h1'):
            a = h1.find('a')
            if not a or not a.get('href'):
                continue
            link = a['href']
            if not link.startswith('http'):
                link = f"https://telugu.way2news.com/{link.lstrip('/')}"
            title = a.get_text(strip=True)
            if not title or len(title) < 5:
                continue
            if any(x['link'] == link for x in articles):
                continue
            image = ""
            parent = h1.parent
            if parent:
                img = parent.find('img')
                if img:
                    image = img.get('data-src') or img.get('data-lazy-src') or img.get('src') or ""
            summary = ""
            if parent:
                for p in parent.find_all('p'):
                    text = p.get_text(strip=True)
                    if text and len(text) > 20:
                        summary = text
                        break
            articles.append({"link": link, "title": title[:200], "summary": summary or title, "image": image, "category": "", "_telugu": True})
        for a in articles[:20]:
            if await save_article(a, "way2news.com"):
                added += 1
    except Exception as e:
        logger.error(f"Way2News scraper error: {e}")
    return added


# ===== SCRAPER LOOP =====
async def scraper_loop():
    await asyncio.sleep(5)
    while True:
        global scraper_status
        scraper_status["running"] = True
        scraper_status["error"] = None
        total = 0
        new_article_ids = []
        try:
            results = await asyncio.gather(
                scrape_siasat(),
                scrape_deccan_chronicle(),
                scrape_toi(),
                scrape_eenadu(),
                scrape_way2news(),
                return_exceptions=True
            )
            for r in results:
                if isinstance(r, int):
                    total += r
                elif isinstance(r, Exception):
                    logger.error(f"Scraper error: {r}")
            scraper_status["last_run"] = datetime.now(timezone.utc).isoformat()
            scraper_status["articles_added"] = total
            logger.info(f"All scrapers done: {total} new articles added")
            # Run AI agents after scraping (fire-and-forget)
            if total > 0:
                try:
                    from routes.agents import run_agents_after_scrape
                    asyncio.create_task(run_agents_after_scrape())
                except Exception as ae:
                    logger.error(f"Agent launch error: {ae}")
                # Run SEO processing (meta generation + IndexNow ping)
                try:
                    from routes.seo_engine import seo_after_scrape
                    # Get recently added article IDs
                    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
                    recent = await db.news.find(
                        {"created_at": {"$gte": cutoff}}, {"_id": 0, "id": 1}
                    ).to_list(100)
                    ids = [a["id"] for a in recent]
                    if ids:
                        asyncio.create_task(seo_after_scrape(ids))
                except Exception as se:
                    logger.error(f"SEO after scrape error: {se}")
        except Exception as e:
            scraper_status["error"] = str(e)
            logger.error(f"Scraper loop error: {e}")
        finally:
            scraper_status["running"] = False
        await asyncio.sleep(1800)  # 30 minutes


@router.post("/scraper/trigger")
async def trigger_scraper():
    if scraper_status["running"]:
        return {"status": "already_running"}
    total = 0
    results = await asyncio.gather(scrape_siasat(), scrape_deccan_chronicle(), scrape_toi(), scrape_eenadu(), scrape_way2news(), return_exceptions=True)
    for r in results:
        if isinstance(r, int):
            total += r
    return {"status": "completed", "articles_added": total}

@router.get("/scraper/status")
async def get_scraper_status():
    return scraper_status

@router.get("/notifications/breaking")
async def get_breaking_news():
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=35)).isoformat()
    articles = await db.news.find({"created_at": {"$gte": cutoff}, "is_active": True}, {"_id": 0, "id": 1, "title": 1, "category": 1, "image": 1}).sort("created_at", -1).limit(5).to_list(5)
    return {"breaking": articles, "count": len(articles)}

@router.get("/health")
async def health_check():
    return {"status": "ok"}
