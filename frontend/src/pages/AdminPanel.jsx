import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { API, AppContext } from "../App";
import { toast } from "sonner";
import {
  Plus, Trash2, Edit2, Pin, PinOff, Link2, Loader2,
  RefreshCw, CheckCircle, ArrowLeft, Globe, Video, Users, BarChart3, Bot, Rocket
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import ApiKeysManager from "../components/ApiKeysManager";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { AdminReporters } from "../components/AdminReporters";
import { AdminStartupApplications } from "../components/AdminStartupApplications";
import { FileUpload } from "../components/FileUpload";

export default function AdminPanel() {
  const { language, darkMode, categories } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("news");
  
  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [adminSearch, setAdminSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scraperStatus, setScraperStatus] = useState(null);
  const [triggeringScraper, setTriggeringScraper] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    title_te: "",
    summary: "",
    summary_te: "",
    category: "local",
    image: "",
    video_url: "",
    content_type: "text",
    link: "",
    is_pinned: false,
    priority: 5,
    source: "",
    published_at: ""
  });
  
  // Scrape URL state
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeCategory, setScrapeCategory] = useState("local");
  const [doRephrase, setDoRephrase] = useState(true);
  const [doTranslate, setDoTranslate] = useState(true);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(page * PAGE_SIZE) });
      if (adminSearch.trim().length >= 2) params.set("q", adminSearch.trim());
      const response = await axios.get(`${API}/news/admin/all?${params.toString()}`);
      const data = response.data;
      // Backend now returns { total, limit, skip, articles }. Fallback to array for safety.
      if (Array.isArray(data)) {
        setArticles(data);
        setTotalArticles(data.length);
      } else {
        setArticles(data.articles || []);
        setTotalArticles(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [page, adminSearch]);

  useEffect(() => {
    fetchArticles();
    axios.get(`${API}/scraper/status`).then(r => setScraperStatus(r.data)).catch(() => {});
  }, [fetchArticles]);

  // Auto-open edit modal when ?edit={id} param is present (admin clicks Pencil on a news card)
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;
    setActiveTab("news");
    (async () => {
      try {
        const { data } = await axios.get(`${API}/news/article/${editId}`);
        if (data && data.id) {
          openEditModal(data);
          setSearchParams({}, { replace: true });
        }
      } catch (e) {
        toast.error("Article not found");
        setSearchParams({}, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTriggerScraper = async () => {
    try {
      setTriggeringScraper(true);
      const response = await axios.post(`${API}/scraper/trigger`);
      toast.success(`Scraper done! ${response.data.articles_added} new articles added`);
      setScraperStatus(prev => ({ ...prev, last_run: new Date().toISOString(), articles_added: response.data.articles_added }));
      fetchArticles();
    } catch (error) {
      toast.error("Scraper failed");
    } finally {
      setTriggeringScraper(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      title_te: "",
      summary: "",
      summary_te: "",
      category: "local",
      image: "",
      video_url: "",
      content_type: "text",
      link: "",
      is_pinned: false,
      priority: 5,
      source: ""
    });
  };

  const handleScrape = async () => {
    if (!scrapeUrl) {
      toast.error("Please enter a URL to scrape");
      return;
    }

    try {
      setScraping(true);
      const response = await axios.post(`${API}/news/scrape`, {
        url: scrapeUrl,
        category: scrapeCategory,
        rephrase: doRephrase,
        translate_to_telugu: doTranslate
      });

      setFormData(prev => ({
        ...prev,
        title: response.data.title,
        title_te: response.data.title_te,
        summary: response.data.summary,
        summary_te: response.data.summary_te,
        image: response.data.image,
        source: response.data.source,
        link: scrapeUrl,
        category: scrapeCategory
      }));

      toast.success("Content scraped and processed!");
    } catch (error) {
      console.error("Scrape failed:", error);
      toast.error("Failed to scrape URL: " + (error.response?.data?.detail || error.message));
    } finally {
      setScraping(false);
    }
  };

  const handleCreateArticle = async () => {
    if (!formData.title || !formData.summary) {
      toast.error("Title and summary are required");
      return;
    }

    try {
      setSaving(true);
      const payload = { ...formData };
      if (payload.published_at) {
        payload.published_at = new Date(payload.published_at).toISOString();
      } else {
        delete payload.published_at;
      }
      await axios.post(`${API}/news/admin/push`, payload);
      toast.success("Article created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error("Create failed:", error);
      const detail = error.response?.data?.detail || "Failed to create article";
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle) return;

    try {
      setSaving(true);
      const payload = { ...formData };
      // Convert datetime-local input → ISO; empty string means "don't override"
      if (payload.published_at) {
        try { payload.published_at = new Date(payload.published_at).toISOString(); }
        catch { delete payload.published_at; }
      } else {
        delete payload.published_at;
      }
      await axios.put(`${API}/news/admin/${editingArticle.id}`, payload);
      toast.success("Article updated successfully!");
      setShowEditModal(false);
      setEditingArticle(null);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update article");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm(language === "en" ? "Are you sure you want to delete this article?" : "మీరు ఈ వార్తను తొలగించాలనుకుంటున్నారా?")) {
      return;
    }

    try {
      await axios.delete(`${API}/news/admin/${articleId}`);
      // Optimistic removal
      setArticles(prev => prev.filter(a => a.id !== articleId));
      toast.success("Article deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleTogglePin = async (articleId) => {
    // Optimistic update to avoid DOM detachment
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, is_pinned: !a.is_pinned } : a));
    try {
      await axios.post(`${API}/news/admin/${articleId}/pin`);
      toast.success("Pin status updated");
    } catch (error) {
      // Revert on failure
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, is_pinned: !a.is_pinned } : a));
      console.error("Pin toggle failed:", error);
      toast.error("Failed to update pin status");
    }
  };

  const toDatetimeLocal = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      // Format as YYYY-MM-DDTHH:mm in local time for <input type="datetime-local">
      const tz = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tz).toISOString().slice(0, 16);
    } catch { return ""; }
  };

  const openEditModal = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || "",
      title_te: article.title_te || "",
      summary: article.summary || "",
      summary_te: article.summary_te || "",
      category: article.category || "local",
      image: article.image || "",
      video_url: article.video_url || "",
      content_type: article.content_type || "text",
      link: article.link || "",
      is_pinned: article.is_pinned || false,
      priority: article.priority || 5,
      source: article.source || "",
      published_at: toDatetimeLocal(article.published_at || article.created_at)
    });
    setShowEditModal(true);
  };

  const getTimeAgo = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "";
    }
  };

  const getCategoryLabel = (cat) => {
    return categories[cat]?.en || cat;
  };

  return (
    <div data-testid="admin-panel-page" className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sticky top-14 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              data-testid="admin-back-btn"
              onClick={() => navigate("/")}
              className="h-9 w-9"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">
              {language === "en" ? "Admin Panel" : "అడ్మిన్ ప్యానెల్"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              data-testid="analytics-btn"
              onClick={() => navigate("/analytics")}
              className="gap-1"
            >
              <BarChart3 size={16} />
              {language === "en" ? "Analytics" : "అనలిటిక్స్"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              data-testid="agents-btn"
              onClick={() => navigate("/agents")}
              className="gap-1"
            >
              <Bot size={16} />
              {language === "en" ? "AI Agents" : "AI ఏజెంట్స్"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-testid="admin-refresh-btn"
              onClick={fetchArticles}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button
              data-testid="create-article-btn"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus size={16} className="mr-1" />
              {language === "en" ? "Push News" : "వార్త పుష్ చేయండి"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="news" data-testid="admin-news-tab">
              {language === "en" ? "News" : "వార్తలు"}
            </TabsTrigger>
            <TabsTrigger value="reporters" data-testid="admin-reporters-tab" className="relative">
              <Users size={16} className="mr-1" />
              Reporters
            </TabsTrigger>
            <TabsTrigger value="startups" data-testid="admin-startups-tab">
              <Rocket size={16} className="mr-1" />
              Startups
            </TabsTrigger>
            <TabsTrigger value="apikeys" data-testid="admin-apikeys-tab">
              <Link2 size={16} className="mr-1" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reporters">
            <AdminReporters />
          </TabsContent>

          <TabsContent value="startups">
            <AdminStartupApplications />
          </TabsContent>

          <TabsContent value="news">
        {/* Admin search + pagination top bar */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <input
              data-testid="admin-news-search"
              type="text"
              value={adminSearch}
              onChange={(e) => { setAdminSearch(e.target.value); setPage(0); }}
              placeholder="Search articles by title, summary, source..."
              className={`w-full px-4 py-2 rounded-lg border text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-300 placeholder-slate-400"}`}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button data-testid="admin-news-prev-btn" variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Prev
            </Button>
            <span className={darkMode ? "text-slate-300" : "text-slate-700"}>
              <span className="font-bold">{page * PAGE_SIZE + 1}</span>
              –<span className="font-bold">{Math.min((page + 1) * PAGE_SIZE, totalArticles)}</span>
              {" "}of <span className="font-bold">{totalArticles}</span>
            </span>
            <Button data-testid="admin-news-next-btn" variant="outline" size="sm" disabled={loading || (page + 1) * PAGE_SIZE >= totalArticles} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <p className="text-2xl font-bold text-orange-500">{totalArticles}</p>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {language === "en" ? "Total Articles" : "మొత్తం వార్తలు"}
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <p className="text-2xl font-bold text-green-600">
              {articles.filter(a => a.is_active).length}
            </p>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {language === "en" ? "Active" : "యాక్టివ్"}
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <p className="text-2xl font-bold text-amber-600">
              {articles.filter(a => a.is_pinned).length}
            </p>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {language === "en" ? "Pinned" : "పిన్ చేయబడింది"}
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <p className="text-2xl font-bold text-violet-600">
              {articles.filter(a => a.content_type === "video").length}
            </p>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {language === "en" ? "Videos" : "వీడియోలు"}
            </p>
          </div>
        </div>

        {/* Siasat.com Auto-Scraper Control */}
        <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${darkMode ? "bg-slate-800 border-slate-700" : "bg-orange-50 border-orange-200"}`}>
          <div>
            <p className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
              Siasat.com Auto-Scraper
            </p>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {scraperStatus?.last_run
                ? `Last run: ${new Date(scraperStatus.last_run).toLocaleString()} | Added: ${scraperStatus.articles_added} articles`
                : "Not run yet"}
              {scraperStatus?.running && " | Running..."}
            </p>
          </div>
          <Button
            data-testid="trigger-scraper-btn"
            size="sm"
            disabled={triggeringScraper}
            onClick={handleTriggerScraper}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {triggeringScraper ? <Loader2 size={16} className="animate-spin mr-1" /> : <RefreshCw size={16} className="mr-1" />}
            {triggeringScraper ? "Scraping..." : "Scrape Now"}
          </Button>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[40%]">{language === "en" ? "Title" : "శీర్షిక"}</TableHead>
                <TableHead>{language === "en" ? "Category" : "వర్గం"}</TableHead>
                <TableHead>{language === "en" ? "Status" : "స్థితి"}</TableHead>
                <TableHead>{language === "en" ? "Created" : "సృష్టించబడింది"}</TableHead>
                <TableHead className="text-right">{language === "en" ? "Actions" : "చర్యలు"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                    <p className="text-slate-500">Loading...</p>
                  </TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <p className="text-slate-500">No articles yet. Push your first news!</p>
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.id} data-testid={`article-row-${article.id}`}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {article.image && (
                          <img 
                            src={article.image} 
                            alt="" 
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 line-clamp-2 text-sm">
                            {article.title}
                          </p>
                          {article.content_type === "video" && (
                            <Badge variant="secondary" className="mt-1">
                              <Video size={10} className="mr-1" /> Video
                            </Badge>
                          )}
                          {article.source === "siasat.com" && (
                            <Badge variant="outline" className="mt-1 text-orange-600 border-orange-300">
                              siasat.com
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(article.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {article.is_active ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 w-fit">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">Inactive</Badge>
                        )}
                        {article.is_pinned && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 w-fit">
                            <Pin size={10} className="mr-1" /> Pinned
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {getTimeAgo(article.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`pin-btn-${article.id}`}
                          onClick={() => handleTogglePin(article.id)}
                          className="h-8 w-8"
                          title={article.is_pinned ? "Unpin" : "Pin"}
                        >
                          {article.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`edit-btn-${article.id}`}
                          onClick={() => openEditModal(article)}
                          className="h-8 w-8"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`delete-btn-${article.id}`}
                          onClick={() => handleDeleteArticle(article.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
          </TabsContent>

          {/* API Keys Management */}
          <TabsContent value="apikeys">
            <ApiKeysManager darkMode={darkMode} />
          </TabsContent>

        </Tabs>
      </div>

      {/* Create Article Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-article-modal">
          <DialogHeader>
            <DialogTitle>
              {language === "en" ? "Push New Article" : "కొత్త వార్త పుష్ చేయండి"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" data-testid="tab-manual">
                {language === "en" ? "Manual Entry" : "మాన్యువల్"}
              </TabsTrigger>
              <TabsTrigger value="scrape" data-testid="tab-scrape">
                <Globe size={14} className="mr-1" />
                {language === "en" ? "Scrape URL" : "URL స్క్రాప్"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scrape" className="space-y-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label>URL to Scrape</Label>
                  <Input
                    data-testid="scrape-url-input"
                    placeholder="https://example.com/news-article"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={scrapeCategory} onValueChange={setScrapeCategory}>
                    <SelectTrigger data-testid="scrape-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="rephrase"
                      checked={doRephrase}
                      onCheckedChange={setDoRephrase}
                    />
                    <Label htmlFor="rephrase" className="text-sm">AI Rephrase</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="translate"
                      checked={doTranslate}
                      onCheckedChange={setDoTranslate}
                    />
                    <Label htmlFor="translate" className="text-sm">Translate to Telugu</Label>
                  </div>
                </div>

                <Button
                  data-testid="scrape-btn"
                  onClick={handleScrape}
                  disabled={scraping || !scrapeUrl}
                  className="w-full"
                >
                  {scraping ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Scraping & Processing...
                    </>
                  ) : (
                    <>
                      <Link2 size={16} className="mr-2" />
                      Scrape & Fill Form
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              {/* Form is shown below tabs for both manual and after scrape */}
            </TabsContent>
          </Tabs>

          {/* Article Form */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (English) *</Label>
                <Input
                  data-testid="title-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </div>
              <div className="space-y-2">
                <Label>Title (Telugu)</Label>
                <Input
                  data-testid="title-te-input"
                  value={formData.title_te}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_te: e.target.value }))}
                  placeholder="తెలుగులో శీర్షిక"
                  className="font-telugu"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Summary (English) *</Label>
                <Textarea
                  data-testid="summary-input"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Enter summary"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Summary (Telugu)</Label>
                <Textarea
                  data-testid="summary-te-input"
                  value={formData.summary_te}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary_te: e.target.value }))}
                  placeholder="తెలుగులో సారాంశం"
                  rows={4}
                  className="font-telugu"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select 
                  value={formData.content_type} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, content_type: val }))}
                >
                  <SelectTrigger data-testid="content-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{language === "en" ? "News Image" : "వార్త ఇమేజ్"}</Label>
                <FileUpload 
                  type="image"
                  currentUrl={formData.image}
                  onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "News Video (Upload or YouTube URL)" : "వార్త వీడియో"}</Label>
                {formData.content_type === "video" && (
                  <FileUpload 
                    type="video"
                    currentUrl={formData.video_url}
                    onUpload={(url) => setFormData(prev => ({ ...prev, video_url: url }))}
                  />
                )}
                <Input
                  data-testid="video-url-input"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="Or paste YouTube URL..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Link</Label>
                <Input
                  data-testid="link-input"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://source.com/article"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority (1=highest)</Label>
                <Input
                  data-testid="priority-input"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === "en" ? "Publish Date & Time (leave empty for now)" : "ప్రచురణ తేదీ & సమయం"}</Label>
              <Input
                data-testid="published-at-input"
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
              />
              <p className="text-xs text-slate-400">Set a past date to backdate, future date to schedule, or leave empty to publish now.</p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_pinned"
                checked={formData.is_pinned}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_pinned: checked }))}
              />
              <Label htmlFor="is_pinned">Pin this article</Label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              data-testid="save-article-btn"
              onClick={handleCreateArticle}
              disabled={saving || !formData.title || !formData.summary}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Push Article
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="edit-article-modal">
          <DialogHeader>
            <DialogTitle>
              {language === "en" ? "Edit Article" : "వార్తను సవరించండి"}
            </DialogTitle>
          </DialogHeader>

          {/* Same form as create */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (English) *</Label>
                <Input
                  data-testid="edit-title-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Title (Telugu)</Label>
                <Input
                  data-testid="edit-title-te-input"
                  value={formData.title_te}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_te: e.target.value }))}
                  className="font-telugu"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Summary (English) *</Label>
                <Textarea
                  data-testid="edit-summary-input"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Summary (Telugu)</Label>
                <Textarea
                  data-testid="edit-summary-te-input"
                  value={formData.summary_te}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary_te: e.target.value }))}
                  rows={4}
                  className="font-telugu"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger data-testid="edit-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select 
                  value={formData.content_type} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, content_type: val }))}
                >
                  <SelectTrigger data-testid="edit-content-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  data-testid="edit-image-input"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  data-testid="edit-video-url-input"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Link</Label>
                <Input
                  data-testid="edit-link-input"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  data-testid="edit-priority-input"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>

            {/* Published date/time override */}
            <div className="space-y-2">
              <Label htmlFor="edit-published-at">
                Publish Date & Time
                <span className="text-xs font-normal text-slate-500 ml-2">(override the displayed timestamp)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-published-at"
                  data-testid="edit-published-at-input"
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="edit-published-at-now-btn"
                  onClick={() => setFormData(prev => ({ ...prev, published_at: toDatetimeLocal(new Date().toISOString()) }))}
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="edit-published-at-clear-btn"
                  onClick={() => setFormData(prev => ({ ...prev, published_at: "" }))}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="edit_is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_pinned: checked }))}
                />
                <Label htmlFor="edit_is_pinned">Pin article</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              data-testid="update-article-btn"
              onClick={handleUpdateArticle}
              disabled={saving || !formData.title || !formData.summary}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Update Article
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { AdminPanel };
