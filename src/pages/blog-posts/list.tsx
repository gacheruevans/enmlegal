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
} from "@heroicons/react/24/outline";

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

export const BlogPostList: React.FC = () => {
  const { edit, create } = useNavigation();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete modal state
  const [deleteModalPost, setDeleteModalPost] = useState<PostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick action loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalPost) return;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${deleteModalPost.id}`);
      setPosts((prev) => prev.filter((p) => p.id !== deleteModalPost.id));
      setDeleteModalPost(null);
    } catch (err: any) {
      alert("Failed to delete post: " + (err.response?.data?.message || err.message));
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
          <button
            onClick={fetchPostsAndCategories}
            title="Refresh articles"
            className="p-2.5 text-gray-500 hover:text-royal hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
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
                {filteredPosts.map((post) => {
                  const scheduledFuture =
                    post.status === "PUBLISHED" && isFutureScheduled(post.datetime);

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50/70 transition-colors"
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
                            <button
                              onClick={() => handleUpdateStatus(post.id, "PUBLISHED")}
                              disabled={actionLoadingId === post.id}
                              title="Publish article immediately"
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                            >
                              Publish
                            </button>
                          )}
                          {post.status === "PUBLISHED" && (
                            <button
                              onClick={() => handleUpdateStatus(post.id, "DRAFT")}
                              disabled={actionLoadingId === post.id}
                              title="Revert to draft"
                              className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer"
                            >
                              Draft
                            </button>
                          )}
                          {post.status !== "ARCHIVED" ? (
                            <button
                              onClick={() => handleUpdateStatus(post.id, "ARCHIVED")}
                              disabled={actionLoadingId === post.id}
                              title="Archive article"
                              className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            >
                              <ArchiveBoxIcon className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(post.id, "DRAFT")}
                              disabled={actionLoadingId === post.id}
                              title="Restore to Draft"
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                            >
                              Restore
                            </button>
                          )}

                          {/* Public View Link */}
                          <a
                            href={`/blog/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Public Article"
                            className="p-1.5 text-gray-400 hover:text-royal hover:bg-blue-50 rounded-lg transition cursor-pointer inline-flex items-center"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </a>

                          {/* Edit Button */}
                          <button
                            onClick={() => edit("blog_posts", post.id)}
                            title="Edit Article"
                            className="p-1.5 text-gray-500 hover:text-royal hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteModalPost(post)}
                            title="Delete Article"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
