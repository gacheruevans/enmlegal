import { useNavigation } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { type ColumnDef, flexRender } from "@tanstack/react-table";
import React from "react";

export const BlogPostList = () => {
  const { edit, show, create } = useNavigation();

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => <span className="font-mono text-xs text-gray-500 truncate max-w-[80px] block">{getValue<string>()}</span>,
      },
      {
        id: "title",
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue }) => <span className="font-semibold text-gray-900">{getValue<string>()}</span>,
      },
      {
        id: "category",
        header: "Category",
        accessorKey: "category.title",
        cell: ({ getValue }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
            {getValue<string>() || "None"}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const isPublished = status === "PUBLISHED";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created At",
        cell: function render({ getValue }) {
          return (
            <span className="text-sm text-gray-500">
              {new Date(getValue<any>()).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        id: "actions",
        accessorKey: "id",
        header: "Actions",
        cell: function render({ getValue }) {
          const id = getValue() as string;
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => show("blog_posts", id)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
              >
                View
              </button>
              <button
                onClick={() => edit("blog_posts", id)}
                className="px-2.5 py-1 text-xs font-medium text-white bg-royal rounded hover:bg-royal/90 cursor-pointer"
              >
                Edit
              </button>
            </div>
          );
        },
      },
    ],
    [show, edit]
  );

  const {
    getHeaderGroups,
    getRowModel,
    getState,
    setPageIndex,
    getCanPreviousPage,
    getPageCount,
    getCanNextPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable({
    columns,
    refineCoreProps: {
      resource: "blog_posts",
    },
  });

  const currentPage = getState().pagination.pageIndex + 1;
  const pageCount = getPageCount();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow">
      {/* Title Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-500">Manage articles, edit drafts and upload images.</p>
        </div>
        <button
          onClick={() => create("blog_posts")}
          className="px-4 py-2 text-sm font-semibold text-white transition rounded-lg shadow cursor-pointer bg-royal hover:bg-royal/90"
        >
          Create Post
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                  No blog posts found. Create your first post!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 rounded-b-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPageIndex(0)}
            disabled={!getCanPreviousPage()}
            className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {"<<"}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!getCanPreviousPage()}
            className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {"<"}
          </button>
          <span className="text-sm text-gray-700">
            Page <strong className="font-semibold text-gray-900">{currentPage}</strong> of{" "}
            <strong className="font-semibold text-gray-900">{pageCount || 1}</strong>
          </span>
          <button
            onClick={() => nextPage()}
            disabled={!getCanNextPage()}
            className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {">"}
          </button>
          <button
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={!getCanNextPage()}
            className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {">>"}
          </button>
        </div>

        <div className="flex items-center space-x-3 text-sm text-gray-700">
          <div>
            <span>Show: </span>
            <select
              value={getState().pagination.pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
              className="ml-1 px-2.5 py-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-royal"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
