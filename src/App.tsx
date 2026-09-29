import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import "./App.css";

import { Layout } from "./components/layout";
import { AdminLayout } from "./components/admin-layout";
import { Login } from "./pages/login/login";
import { ViewPost } from "./pages/blog/view";
import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { BlogPostList, BlogPostCreate, BlogPostEdit, BlogPostShow } from "./pages/blog-posts";
import { CategoryList } from "./pages/categories/list";
import { isTokenExpired, clearAuth } from "./lib/auth";

import { TermsOfService } from "./pages/legal/TermsOfService";
import { PrivacyPolicy } from "./pages/legal/PrivacyPolicy";
import { License } from "./pages/legal/License";

const AdminRoute = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token || isTokenExpired(token)) {
    if (token) {
      clearAuth();
      return <Navigate to="/login?expired=1" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
};

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
          {/* Public Landing Page & Clean Section Routes (NO `#` in URL) */}
          <Route path="/" element={<Layout />} />
          <Route path="/home" element={<Layout />} />
          <Route path="/about" element={<Layout />} />
          <Route path="/practice-areas" element={<Layout />} />
          <Route path="/services" element={<Layout />} />
          <Route path="/blog" element={<Layout />} />
          <Route path="/contacts" element={<Layout />} />

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/license" element={<License />} />

          {/* Blog Article View */}
          <Route path="/view" element={<ViewPost />} />
          <Route path="/view/:id" element={<ViewPost />} />
          <Route path="/blog/:id" element={<ViewPost />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Admin Panel (Protected) */}
          <Route path="/admin" element={<AdminRoute />}>
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
