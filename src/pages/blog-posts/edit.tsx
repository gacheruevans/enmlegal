import { useNavigation, useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import React from "react";
import { CATEGORIES_SELECT_QUERY, POST_EDIT_MUTATION } from "./queries";

export const BlogPostEdit = () => {
  const { list } = useNavigation();

  const {
    refineCore: { onFinish, queryResult },
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    refineCoreProps: {
      meta: {
        gqlMutation: POST_EDIT_MUTATION,
      },
    },
  });

  const blogPostsData = queryResult?.data?.data;

  const { options: categoryOptions } = useSelect({
    resource: "categories",
    defaultValue: blogPostsData?.category?.id,
    meta: {
      gqlQuery: CATEGORIES_SELECT_QUERY,
    },
  });

  React.useEffect(() => {
    setValue("categoryId", blogPostsData?.category?.id);
  }, [categoryOptions]);

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Edit</h1>
        <div>
          <button
            onClick={() => {
              list("blog_posts");
            }}
          >
            List
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onFinish)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label>
            <span style={{ marginRight: "8px" }}>Title</span>
            <input
              type="text"
              {...register("title", {
                required: "This field is required",
              })}
            />
            <span style={{ color: "red" }}>
              {(errors as any)?.title?.message as string}
            </span>
          </label>
          <label>
            <span style={{ marginRight: "8px" }}>Content</span>
            <textarea
              rows={5}
              cols={33}
              style={{ verticalAlign: "top" }}
              {...register("content", {
                required: "This field is required",
              })}
            />
            <span style={{ color: "red" }}>
              {(errors as any)?.content?.message as string}
            </span>
          </label>
          <label>
            <span style={{ marginRight: "8px" }}>Category</span>
            <select
              {...register("categoryId", {
                required: "This field is required",
              })}
            >
              {categoryOptions?.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span style={{ color: "red" }}>
              {(errors as any)?.category?.id?.message as string}
            </span>
          </label>
          <label>
            <span style={{ marginRight: "8px" }}>Status</span>
            <select
              defaultValue="draft"
              {...register("status", {
                required: "This field is required",
              })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <span style={{ color: "red" }}>
              {(errors as any)?.status?.message as string}
            </span>
          </label>
          <div>
            <input type="submit" value="Save" />
          </div>
        </div>
      </form>
    </div>
  );
};
