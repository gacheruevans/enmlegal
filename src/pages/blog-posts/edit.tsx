import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@refinedev/core";
import { useParams, useNavigate } from "react-router";
import Markdown from "react-markdown";
import api from "../../lib/api";
import {
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  title: string;
  slug: string;
}

export const BlogPostEdit: React.FC = () => {
  const { list } = useNavigation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [scheduledDatetime, setScheduledDatetime] = useState<string>("");
  const [scheduleMode, setScheduleMode] = useState<"immediate" | "scheduled">("immediate");

  // Auxiliary State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingContentImg, setUploadingContentImg] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Quick Add Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  // Load existing post and categories
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [postRes, catsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get("/categories"),
        ]);

        const post = postRes.data;
        setTitle(post.title || "");
        setDescription(post.description || "");
        setContent(post.content || "");
        setCategoryId(post.categoryId || "");
        setStatus(post.status || "DRAFT");
        setImageUrl(post.imageUrl || "");

        if (post.datetime) {
          // If datetime is formatted as ISO, convert to YYYY-MM-DDTHH:mm for datetime-local
          const d = new Date(post.datetime);
          if (!isNaN(d.getTime())) {
            const pad = (n: number) => String(n).padStart(2, "0");
            const localFormat = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
              d.getDate()
            )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            setScheduledDatetime(localFormat);

            if (d.getTime() > Date.now()) {
              setScheduleMode("scheduled");
            }
          }
        }

        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || "Failed to load the article details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingCover(true);
    setErrorMsg("");
    try {
      const { data } = await api.post("/posts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(data.url);
    } catch (err: any) {
      alert("Cover image upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle In-Content Image Insertion
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingContentImg(true);
    try {
      const { data } = await api.post("/posts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      insertMarkdownAtCursor(`\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${data.url})\n\n`);
    } catch (err: any) {
      alert("Article image upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingContentImg(false);
      if (e.target) e.target.value = "";
    }
  };

  // Insert markdown helper
  const insertMarkdownAtCursor = (markdownSnippet: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + markdownSnippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.substring(0, start) + markdownSnippet + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + markdownSnippet.length,
        start + markdownSnippet.length
      );
    }, 50);
  };

  // Quick Category Creation
  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle.trim()) return;

    setCreatingCat(true);
    try {
      const { data } = await api.post("/categories", {
        title: newCatTitle.trim(),
      });
      setCategories((prev) => [...prev, data]);
      setCategoryId(data.id);
      setNewCatTitle("");
      setCatModalOpen(false);
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Failed to create category. Ensure the title is unique."
      );
    } finally {
      setCreatingCat(false);
    }
  };

  // Save / Update Article
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      setErrorMsg("Please fill in the title, category, and content.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        content,
        categoryId,
        status,
        imageUrl: imageUrl || null,
      };

      if (scheduleMode === "scheduled" && scheduledDatetime) {
        payload.datetime = new Date(scheduledDatetime).toISOString();
      } else {
        payload.datetime = new Date().toISOString();
      }

      await api.patch(`/posts/${id}`, payload);
      setSuccessMsg("Article updated successfully!");
      setTimeout(() => {
        list("blog_posts");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Failed to save post changes."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Article
  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate("/admin/blog-posts");
    } catch (err: any) {
      alert("Failed to delete post: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-royal border-t-transparent mb-3"></div>
        <p className="text-sm text-gray-500">Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => list("blog_posts")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-royal transition cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Articles
        </button>

        <div className="flex items-center gap-3">
          <a
            href={`/blog/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            <EyeIcon className="w-4 h-4" />
            Preview Public View
          </a>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Post
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter a compelling legal article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-base font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis for article cards and SEO meta descriptions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
                />
              </div>
            </div>

            {/* Markdown Body & In-Content Image Inserter */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Editor Header & Format Bar */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeTab === "write"
                        ? "bg-white text-royal shadow-xs border border-gray-200"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeTab === "preview"
                        ? "bg-white text-royal shadow-xs border border-gray-200"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <EyeIcon className="w-3.5 h-3.5" />
                    Live Preview
                  </button>
                </div>

                {/* Toolbar */}
                {activeTab === "write" && (
                  <div className="flex items-center gap-1">
                    {/* Insert Image Button */}
                    <button
                      type="button"
                      onClick={() => contentImageInputRef.current?.click()}
                      disabled={uploadingContentImg}
                      className="px-2.5 py-1 text-xs font-semibold text-royal bg-royal/10 hover:bg-royal/20 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Upload and insert an image directly into the article content"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      {uploadingContentImg ? "Uploading Image..." : "Insert Image"}
                    </button>
                    <input
                      ref={contentImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleContentImageUpload}
                    />

                    {/* Quick Formatting Helpers */}
                    <button
                      type="button"
                      onClick={() => insertMarkdownAtCursor("**Bold Text**")}
                      className="p-1 px-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAtCursor("*Italic Text*")}
                      className="p-1 px-2 text-xs italic text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAtCursor("\n## Heading 2\n")}
                      className="p-1 px-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAtCursor("\n### Heading 3\n")}
                      className="p-1 px-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAtCursor("\n> Blockquote\n")}
                      className="p-1 px-2 text-xs font-mono text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                      title="Quote"
                    >
                      &ldquo;&rdquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownAtCursor("\n- Bullet item\n- Bullet item\n")}
                      className="p-1 px-2 text-xs text-gray-600 hover:bg-gray-200 rounded cursor-pointer"
                      title="Bullet List"
                    >
                      &bull; List
                    </button>
                  </div>
                )}
              </div>

              {/* Editor / Preview Area */}
              {activeTab === "write" ? (
                <div className="p-4">
                  <textarea
                    ref={contentTextareaRef}
                    rows={16}
                    required
                    placeholder="Write article in Markdown. Use toolbar above to insert images and formatting..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 font-mono text-sm leading-relaxed border-0 focus:outline-none resize-y text-gray-800"
                  />
                </div>
              ) : (
                <div className="p-6 min-h-[380px] prose prose-slate max-w-none bg-white">
                  {content ? (
                    <Markdown>{content}</Markdown>
                  ) : (
                    <p className="text-gray-400 italic">No content to preview yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (Settings, Category, Schedule, Cover) */}
          <div className="space-y-6">
            {/* Publish & Status Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                Publication Status
              </h3>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Article Status
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setStatus("DRAFT")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      status === "DRAFT"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("PUBLISHED")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      status === "PUBLISHED"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("ARCHIVED")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      status === "ARCHIVED"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Archived
                  </button>
                </div>
              </div>

              {/* Scheduling Options */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700">
                  Publish Timing
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleMode"
                      checked={scheduleMode === "immediate"}
                      onChange={() => setScheduleMode("immediate")}
                      className="text-royal focus:ring-royal/20"
                    />
                    <span>Publish Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleMode"
                      checked={scheduleMode === "scheduled"}
                      onChange={() => setScheduleMode("scheduled")}
                      className="text-royal focus:ring-royal/20"
                    />
                    <span>Schedule for specific Date & Time</span>
                  </label>
                </div>

                {scheduleMode === "scheduled" && (
                  <div className="pt-2 space-y-2">
                    <div className="relative">
                      <CalendarDaysIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={scheduledDatetime}
                        onChange={(e) => setScheduledDatetime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal bg-white"
                      />
                    </div>
                    {scheduledDatetime && (
                      <p className="text-[11px] text-amber-600 font-medium">
                        Will publish on:{" "}
                        {new Date(scheduledDatetime).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-royal hover:bg-royal/90 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Save & Update Post
                  </>
                )}
              </button>
            </div>

            {/* Category Card & Quick Creator */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Category
                </h3>
                <button
                  type="button"
                  onClick={() => setCatModalOpen(true)}
                  className="text-xs font-bold text-royal hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  New
                </button>
              </div>

              <div>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-400">
                  Select the practice area or legal topic for this article.
                </p>
              </div>
            </div>

            {/* Cover Image Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Cover Image
                </h3>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl}
                    alt="Cover preview"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 bg-white text-xs font-semibold text-gray-800 rounded-lg cursor-pointer hover:bg-gray-100">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-royal/50 hover:bg-gray-50/50 transition">
                  <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs font-semibold text-royal">
                    {uploadingCover ? "Uploading Cover..." : "Click to upload cover image"}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    PNG, JPG, WEBP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
              )}

              {/* Direct image URL input option */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Or paste Image URL:
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal/30 text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCategory} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Constitutional Law"
                  value={newCatTitle}
                  onChange={(e) => setNewCatTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCat}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-royal hover:bg-royal/90 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {creatingCat ? "Creating..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Blog Article</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to permanently delete this article? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={deleting}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostEdit;
