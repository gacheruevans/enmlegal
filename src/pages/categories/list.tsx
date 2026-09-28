import React, { useState, useEffect } from "react";
import { useNavigation } from "@refinedev/core";
import api from "../../lib/api";
import {
  FolderPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  _count?: {
    posts: number;
  };
}

export const CategoryList: React.FC = () => {
  const { list } = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryTitle("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryTitle(cat.title);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryTitle.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, {
          title: categoryTitle.trim(),
        });
      } else {
        await api.post("/categories", {
          title: categoryTitle.trim(),
        });
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to save category. Please ensure the title is unique."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${id}`);
      setDeleteConfirmId(null);
      await fetchCategories();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Failed to delete category. Articles linked to this category must be reassigned first."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPostsAcrossCategories = categories.reduce(
    (acc, curr) => acc + (curr._count?.posts || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-royal/10 text-royal rounded-xl">
              <FolderPlusIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Article Categories
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Categorize and group your legal publications for visitors and client navigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            title="Refresh categories"
            className="p-2.5 text-gray-500 hover:text-royal hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-royal hover:bg-royal/90 rounded-xl shadow-sm transition transform active:scale-95 cursor-pointer"
          >
            <FolderPlusIcon className="w-5 h-5" />
            Add New Category
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Categories
          </p>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {categories.length}
          </p>
        </div>
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Linked Articles
          </p>
          <p className="text-3xl font-black text-royal mt-2">
            {totalPostsAcrossCategories}
          </p>
        </div>
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Action
          </p>
          <button
            onClick={() => list("blog_posts")}
            className="mt-2 text-sm font-semibold text-royal hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <DocumentTextIcon className="w-4 h-4" />
            View all blog posts &rarr;
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-royal border-t-transparent mb-3"></div>
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center">
            <FolderPlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-semibold text-base">No categories found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm ? "Try adjusting your search criteria." : "Create your first category to start organizing articles."}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-royal rounded-xl hover:bg-royal/90 shadow transition cursor-pointer"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Category Title</th>
                  <th className="py-3.5 px-6">Slug</th>
                  <th className="py-3.5 px-6 text-center">Articles</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCategories.map((cat) => {
                  const postCount = cat._count?.posts ?? 0;
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {cat.title}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            postCount > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {postCount} {postCount === 1 ? "article" : "articles"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                            className="p-1.5 text-gray-500 hover:text-royal hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(cat.id)}
                            title="Delete Category"
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Litigation, Real Estate"
                  value={categoryTitle}
                  onChange={(e) => setCategoryTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
                  autoFocus
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Slug will automatically generate:{" "}
                  <span className="font-mono text-gray-600">
                    {categoryTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "") || "category-slug"}
                  </span>
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-royal hover:bg-royal/90 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Category</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this category? If there are articles assigned to this category, they should be updated or reassigned.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(deleteConfirmId)}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;