import { useNavigation, useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import React, { useState, useEffect } from "react";
import axios from "axios";

export const BlogPostEdit = () => {
  const { list } = useNavigation();
  const [uploading, setUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const {
    refineCore: { onFinish, queryResult },
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    refineCoreProps: {
      resource: "blog_posts",
    },
  });

  const blogPostsData = queryResult?.data?.data;

  const { options: categoryOptions } = useSelect({
    resource: "categories",
    defaultValue: blogPostsData?.categoryId,
    optionLabel: "title",
    optionValue: "id",
  });

  // Pre-fill categories and image preview when data loads
  useEffect(() => {
    if (blogPostsData) {
      setValue("categoryId", blogPostsData.categoryId);
      setValue("imageUrl", blogPostsData.imageUrl);
      if (blogPostsData.imageUrl) {
        setImgPreview(blogPostsData.imageUrl);
      }
    }
  }, [blogPostsData, setValue]);

  // Register image URL hidden field
  useEffect(() => {
    register("imageUrl");
  }, [register]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("http://localhost:3000/posts/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setValue("imageUrl", data.url);
    } catch (err: any) {
      alert("Failed to upload image: " + (err.response?.data?.message || err.message));
      setImgPreview(blogPostsData?.imageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-sm text-gray-500 mt-1">Modify your article details and publication status.</p>
        </div>
        <button
          onClick={() => list("blog_posts")}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
        >
          Back to List
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onFinish)} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
            placeholder="Article title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{(errors.title as any).message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Short Description
          </label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
            placeholder="A brief summary of this post."
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{(errors.description as any).message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Content
          </label>
          <textarea
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition"
            placeholder="Write your article details here..."
            {...register("content", { required: "Content is required" })}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{(errors.content as any).message}</p>
          )}
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal bg-white transition"
              {...register("categoryId", { required: "Category is required" })}
            >
              <option value="">Select a category</option>
              {categoryOptions?.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">This field is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal bg-white transition"
              {...register("status", { required: "Status is required" })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="flex items-start space-x-6">
            <div className="flex-1">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-royal/50 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, JPEG, WEBP (Max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            {/* Preview Box */}
            <div className="w-48 h-32 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 relative overflow-hidden">
              {uploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-royal border-t-transparent"></div>
                  <span className="text-xs text-gray-500 font-medium">Uploading...</span>
                </div>
              ) : imgPreview ? (
                <img
                  src={imgPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400 text-center px-4">No image uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => list("blog_posts")}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold text-white bg-royal rounded-lg hover:bg-royal/90 shadow transition cursor-pointer"
          >
            Update Post
          </button>
        </div>
      </form>
    </div>
  );
};
