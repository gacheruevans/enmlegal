import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import "./App.css";

import { Layout } from "./components/layout";
import { AdminLayout } from "./components/admin-layout";
import { Login } from "./pages/login";
import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { BlogPostList, BlogPostCreate, BlogPostEdit, BlogPostShow } from "./pages/blog-posts";
import { CategoryList } from "./pages/categories/list";

function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider}
        authProvider={authProvider}
        routerProvider={routerProvider}
        resources={[
          {
            name: "blog_posts",
            list: "/admin/blog-posts",
            create: "/admin/blog-posts/create",
            edit: "/admin/blog-posts/edit/:id",
            show: "/admin/blog-posts/show/:id",
            meta: {
              label: "Blog Posts",
            },
          },
          {
            name: "categories",
            list: "/admin/categories",
            meta: {
              label: "Categories",
            },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Layout />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Admin Panel (Protected) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/blog-posts" replace />} />
            <Route path="blog-posts" element={<BlogPostList />} />
            <Route path="blog-posts/create" element={<BlogPostCreate />} />
            <Route path="blog-posts/edit/:id" element={<BlogPostEdit />} />
            <Route path="blog-posts/show/:id" element={<BlogPostShow />} />
            <Route path="categories" element={<CategoryList />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}

export default App;
