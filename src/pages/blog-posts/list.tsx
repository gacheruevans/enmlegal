import React, { useState, useEffect } from "react";
import { useNavigation } from "@refinedev/core";
import api from "../../lib/api";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { NotificationBar, NotificationState } from "../../components/common/NotificationBar";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  date: string;
  datetime: string;
  createdAt: string;
  likes?: number;
  views?: number;
  category?: {
    id: string;
    title: string;
    slug: string;
  };
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Category {
  id: string;
  title: string;
  slug: string;
}

interface ActionTooltipProps {
  label: string;
  roleHint?: string;
  description?: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
  align?: "center" | "right" | "left";
}

const ActionTooltip: React.FC<ActionTooltipProps> = ({
  label,
  roleHint,
  description,
  children,
  position = "top",
  align = "center",
}) => {
  const isTop = position === "top";

  return (
    <div className="relative inline-flex group/tip">
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-50 invisible opacity-0 scale-95 transition-all duration-150 ease-out group-hover/tip:visible group-hover/tip:opacity-100 group-hover/tip:scale-100 group-focus-within/tip:visible group-focus-within/tip:opacity-100 group-focus-within/tip:scale-100 flex flex-col ${
          isTop ? "bottom-full mb-2" : "top-full mt-2"
        } ${
          align === "right"
            ? "right-0 items-end"
            : align === "left"
            ? "left-0 items-start"
            : "left-1/2 -translate-x-1/2 items-center"
        }`}
      >
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/80 min-w-[150px] max-w-[220px] text-left">
          <div className="flex items-center gap-1.5 font-bold text-[11px] leading-tight text-white">
            {roleHint && (
              <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                {roleHint}
              </span>
            )}
            <span className="truncate">{label}</span>
          </div>
          {description && (
            <p className="text-[10.5px] text-slate-300 font-normal mt-1 leading-snug whitespace-normal">
              {description}
            </p>
          )}
        </div>
        {/* Crisp SVG Arrow */}
        <svg
          className={`w-2.5 h-1 text-slate-900 fill-current drop-shadow-xs shrink-0 ${
            isTop ? "order-last -mt-[1px]" : "order-first -mb-[1px] rotate-180"
          } ${
            align === "right" ? "mr-3" : align === "left" ? "ml-3" : ""
          }`}
          viewBox="0 0 10 4"
        >
          <path d="M0 0 L5 4 L10 0 Z" />
        </svg>
      </div>
    </div>
  );
};

export const BlogPostList: React.FC = () => {
  const { edit, create } = useNavigation();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State (Default 10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Notification state
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Delete modal state
  const [deleteModalPost, setDeleteModalPost] = useState<PostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick action loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Reset pagination when filter criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedCategory, pageSize]);

  const fetchPostsAndCategories = async () => {
    setLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        api.get("/posts", {
          params: {
            status: "ALL",
            limit: 100,
            includeFuture: "true",
          },
        }),
        api.get("/categories"),
      ]);

      const items = Array.isArray(postsRes.data?.nodes)
        ? postsRes.data.nodes
        : Array.isArray(postsRes.data)
        ? postsRes.data
        : [];
      setPosts(items);
      setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
    } catch (err) {
      console.error("Failed to fetch posts or categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndCategories();
  }, []);

  const handleUpdateStatus = async (
    postId: string,
    newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  ) => {
    setActionLoadingId(postId);
    try {
      await api.patch(`/posts/${postId}`, { status: newStatus });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
      );
      setNotification({
        type: "success",
        title: "Article Updated",
        message: `Article status updated to ${newStatus}.`,
        duration: 4000,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Update Failed",
        message: err.response?.data?.message || err.message || "Failed to update status.",
        duration: 5000,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalPost) return;
    const targetTitle = deleteModalPost.title;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${deleteModalPost.id}`);
      setPosts((prev) => prev.filter((p) => p.id !== deleteModalPost.id));
      setDeleteModalPost(null);
      setNotification({
        type: "success",
        title: "Article Deleted",
        message: `"${targetTitle}" has been permanently removed.`,
        duration: 4000,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        title: "Deletion Failed",
        message: err.response?.data?.message || err.message || "Failed to delete post.",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter calculations
  const filteredPosts = posts.filter((post) => {
    const matchesStatus =
      statusFilter === "ALL" || post.status === statusFilter;
    const matchesCategory =
      selectedCategory === "ALL" || post.category?.id === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Pagination calculations (Default 10 items per page)
  const totalItems = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Helper for generating page numbers with windowing & ellipsis
  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const countAll = posts.length;
  const countPublished = posts.filter((p) => p.status === "PUBLISHED").length;
  const countDrafts = posts.filter((p) => p.status === "DRAFT").length;
  const countArchived = posts.filter((p) => p.status === "ARCHIVED").length;

  const isFutureScheduled = (datetimeStr?: string) => {
    if (!datetimeStr) return false;
    const dt = new Date(datetimeStr);
    return !isNaN(dt.getTime()) && dt.getTime() > Date.now();
  };

  return (
    <div className="space-y-6">
      {/* Tailwind CSS Notification Bar */}
      {notification && (
        <NotificationBar
          notification={notification}
          onClose={() => setNotification(null)}
          className="sticky top-2 z-40"
        />
      )}

      {/* Top Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-royal/10 text-royal rounded-xl">
              <DocumentTextIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Blog Articles
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit, schedule publication, organize categories, and manage article statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ActionTooltip
            label="Refresh Articles"
            roleHint="Live Sync"
            description="Reload latest blog posts and metrics from database."
            position="bottom"
            align="right"
          >
            <button
              onClick={fetchPostsAndCategories}
              aria-label="Refresh articles"
              className="p-2.5 text-gray-500 hover:text-royal hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </ActionTooltip>
          <button
            onClick={() => create("blog_posts")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-royal hover:bg-royal/90 rounded-xl shadow-sm transition transform active:scale-95 cursor-pointer"
          >
            <PlusIcon className="w-5 h-5" />
            Write New Article
          </button>
        </div>
      </div>

      {/* Admin Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-50 text-royal rounded-xl shrink-0">
            <DocumentTextIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Articles</p>
            <p className="text-xl font-bold text-gray-900">{posts.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Published</p>
            <p className="text-xl font-bold text-gray-900">{countPublished}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <EyeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Reads (Views)</p>
            <p className="text-xl font-bold text-gray-900">
              {posts.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <HeartIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Likes</p>
            <p className="text-xl font-bold text-gray-900">
              {posts.reduce((acc, p) => acc + (p.likes || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "ALL"
                  ? "bg-royal text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Articles <span className="opacity-75">({countAll})</span>
            </button>
            <button
              onClick={() => setStatusFilter("PUBLISHED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "PUBLISHED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Published <span className="opacity-75">({countPublished})</span>
            </button>
            <button
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "DRAFT"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              Drafts <span className="opacity-75">({countDrafts})</span>
            </button>
            <button
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "ARCHIVED"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              Archived <span className="opacity-75">({countArchived})</span>
            </button>
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal bg-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by article title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-royal border-t-transparent mb-3"></div>
            <p>Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-semibold text-base">No articles found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery || statusFilter !== "ALL" || selectedCategory !== "ALL"
                ? "Try clearing filters to see more results."
                : "Get started by composing your first article."}
            </p>
            <button
              onClick={() => create("blog_posts")}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-royal rounded-xl hover:bg-royal/90 shadow transition cursor-pointer"
            >
              Create New Post
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status & Schedule</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-center">Likes</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedPosts.map((post, index) => {
                  const scheduledFuture =
                    post.status === "PUBLISHED" && isFutureScheduled(post.datetime);
                  const isFirstRow = index === 0;
                  const tipPosition = isFirstRow ? "bottom" : "top";

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50/70 transition-colors relative hover:z-20"
                    >
                      {/* Title & Cover Thumbnail */}
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-center gap-3.5">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-14 h-11 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 shrink-0">
                              <DocumentTextIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-royal transition">
                              {post.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {post.description || "No summary provided."}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/60">
                          {post.category?.title || "Uncategorized"}
                        </span>
                      </td>

                      {/* Status & Schedule */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {post.status === "PUBLISHED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Published
                            </span>
                          ) : post.status === "DRAFT" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Draft
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Archived
                            </span>
                          )}

                          {scheduledFuture && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
                              <ClockIcon className="w-3.5 h-3.5" />
                              <span>Scheduled: {new Date(post.datetime).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Views Column */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <EyeIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{(post.views ?? 0).toLocaleString()}</span>
                        </span>
                      </td>

                      {/* Likes Column */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                          <HeartIcon className="w-3.5 h-3.5 text-rose-500" />
                          <span>{(post.likes ?? 0).toLocaleString()}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span>{post.date || new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Publish / Draft Toggle */}
                          {post.status === "DRAFT" && (
                            <ActionTooltip
                              label="Publish Article"
                              roleHint="Status"
                              description="Make this article immediately live and visible to all visitors."
                              position={tipPosition}
                              align="right"
                            >
                              <button
                                onClick={() => handleUpdateStatus(post.id, "PUBLISHED")}
                                disabled={actionLoadingId === post.id}
                                aria-label="Publish article immediately"
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                              >
                                Publish
                              </button>
                            </ActionTooltip>
                          )}
                          {post.status === "PUBLISHED" && (
                            <ActionTooltip
                              label="Revert to Draft"
                              roleHint="Status"
                              description="Unpublish article from public site. Accessible to administrators only."
                              position={tipPosition}
                              align="right"
                            >
                              <button
                                onClick={() => handleUpdateStatus(post.id, "DRAFT")}
                                disabled={actionLoadingId === post.id}
                                aria-label="Revert to draft"
                                className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer"
                              >
                                Draft
                              </button>
                            </ActionTooltip>
                          )}
                          {post.status !== "ARCHIVED" ? (
                            <ActionTooltip
                              label="Archive Article"
                              roleHint="Archive"
                              description="Retire article from live listings while retaining post records."
                              position={tipPosition}
                              align="right"
                            >
                              <button
                                onClick={() => handleUpdateStatus(post.id, "ARCHIVED")}
                                disabled={actionLoadingId === post.id}
                                aria-label="Archive article"
                                className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                              >
                                <ArchiveBoxIcon className="w-4 h-4" />
                              </button>
                            </ActionTooltip>
                          ) : (
                            <ActionTooltip
                              label="Restore to Draft"
                              roleHint="Restore"
                              description="Restore archived article back to draft status for editing or republishing."
                              position={tipPosition}
                              align="right"
                            >
                              <button
                                onClick={() => handleUpdateStatus(post.id, "DRAFT")}
                                disabled={actionLoadingId === post.id}
                                aria-label="Restore to Draft"
                                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                              >
                                Restore
                              </button>
                            </ActionTooltip>
                          )}

                          {/* Public View Link */}
                          <ActionTooltip
                            label="Preview Article"
                            roleHint="Public View"
                            description="Open live public article page in a new browser tab as readers see it."
                            position={tipPosition}
                            align="right"
                          >
                            <a
                              href={`/blog/${post.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="View Public Article"
                              className="p-1.5 text-gray-400 hover:text-royal hover:bg-blue-50 rounded-lg transition cursor-pointer inline-flex items-center"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </a>
                          </ActionTooltip>

                          {/* Edit Button */}
                          <ActionTooltip
                            label="Edit Article"
                            roleHint="Content Editor"
                            description="Modify title, content, cover image, category, and publication date."
                            position={tipPosition}
                            align="right"
                          >
                            <button
                              onClick={() => edit("blog_posts", post.id)}
                              aria-label="Edit Article"
                              className="p-1.5 text-gray-500 hover:text-royal hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                          </ActionTooltip>

                          {/* Delete Button */}
                          <ActionTooltip
                            label="Delete Article"
                            roleHint="Destructive"
                            description="Permanently delete this article from the database. Cannot be undone."
                            position={tipPosition}
                            align="right"
                          >
                            <button
                              onClick={() => setDeleteModalPost(post)}
                              aria-label="Delete Article"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </ActionTooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls Bar (Default: 10 articles per page) */}
        {filteredPosts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Summary Count */}
            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {totalItems === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">{endIndex}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
              articles
              {filteredPosts.length !== posts.length && (
                <span className="text-gray-400 ml-1">
                  (filtered from {posts.length} total)
                </span>
              )}
            </div>

            {/* Middle: Rows Per Page Selector */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Articles per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-royal cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                aria-label="First page"
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="First page"
              >
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage <= 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Numbered Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-xs text-gray-400 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        safeCurrentPage === p
                          ? "bg-royal text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage >= totalPages}
                aria-label="Next page"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                aria-label="Last page"
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Last page"
              >
                <ChevronDoubleRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Blog Article</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to permanently delete{" "}
              <strong className="text-gray-900 font-semibold">
                "{deleteModalPost.title}"
              </strong>
              ? This action will permanently remove the article and cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalPost(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostList;
