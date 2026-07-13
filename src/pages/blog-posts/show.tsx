import { useNavigation, useResource, useShow } from "@refinedev/core";
import React from "react";

export const BlogPostShow = () => {
  const { edit, list } = useNavigation();
  const { id } = useResource();
  const { queryResult } = useShow({
    resource: "blog_posts",
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-royal border-t-transparent"></div>
      </div>
    );
  }

  const isPublished = record?.status === "PUBLISHED";

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 max-w-3xl mx-auto overflow-hidden">
      {/* Cover Image */}
      {record?.imageUrl ? (
        <div className="h-64 w-full relative bg-slate-900">
          <img
            src={record.imageUrl}
            alt={record.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute top-4 right-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                isPublished ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
              }`}
            >
              {record.status}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-20 w-full bg-slate-100 border-b border-gray-200"></div>
      )}

      {/* Header Actions */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-gray-500 font-mono">ID: {record?.id}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => list("blog_posts")}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={() => edit("blog_posts", id ?? "")}
            className="px-4 py-2 text-sm font-semibold text-white bg-royal rounded-lg hover:bg-royal/90 shadow transition cursor-pointer"
          >
            Edit Post
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 space-y-6">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 mb-2">
            {record?.category?.title || "Uncategorized"}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{record?.title}</h1>
          <p className="text-sm text-gray-500 mt-2">
            Published {record?.date || new Date(record?.createdAt).toLocaleDateString()} • By{" "}
            <span className="font-semibold text-gray-700">{record?.author?.name || "Author"}</span>
          </p>
        </div>

        {/* Short Description */}
        {record?.description && (
          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-royal/40">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Summary Description
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed italic">{record.description}</p>
          </div>
        )}

        {/* Article Details */}
        <div className="prose max-w-none text-gray-800 text-sm leading-relaxed whitespace-pre-line border-t border-gray-100 pt-6">
          {record?.content}
        </div>
      </div>
    </div>
  );
};
