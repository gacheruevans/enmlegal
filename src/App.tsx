import axios from "axios"
import { Authenticated, type I18nProvider, Refine } from "@refinedev/core"
import dataProvider from "@refinedev/simple-rest"

import routerProvider, { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router"
import { BrowserRouter, Outlet, Route, Routes } from "react-router"

import "./App.css";
import CssBaseline from "@mui/material/CssBaseline"
import GlobalStyles from "@mui/material/GlobalStyles"

import {
  AuthPage,
  ErrorComponent,
  RefineSnackbarProvider,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/mui"
import { useTranslation } from "react-i18next"

import { authProvider } from "./authProvider"
import { Header } from "./components/header"
import { ColorModeContextProvider } from "./context/color-mode"

import { Layout } from "./components/layout"
import { 
  CategoryCreate,
  CategoryEdit, 
  CategoryList, 
  CategoryShow } from "./pages/categories"
import { 
  PostList, 
  PostCreate, 
  PostShow, 
  PostEdit } from "./pages/posts"

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider: I18nProvider = {
    translate: (key, params) => t(key, params).toString(),
    changeLocale: (lang: string | undefined) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <CssBaseline />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
        <RefineSnackbarProvider>
            <Refine
              dataProvider={dataProvider("./db.json")}
              notificationProvider={useNotificationProvider}
              routerProvider={routerProvider}
              authProvider={authProvider}
              i18nProvider={i18nProvider}
              resources={[
                {
                  name: "posts",
                  list: "/posts",
                  create:"/posts/new",
                  edit: "posts/:id/edit",
                  show: "/posts/:id"
                },{
                  name: "categories",
                  list: "/categories",
                  create: "/categories/new",
                  edit: "/categories/:id/edit",
                  show: "/categories/:id",
                  meta: {
                    canDelete: true,
                  }
                }
              ]}
            >
              <Routes>
                 <Route
                  index
                  path="/"
                  element={
                    <Layout/>
                  }
                />
                <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                      >
                        <ThemedLayoutV2 Header={() => <Header sticky />}>
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                  <Route
                    element={<NavigateToResource resource="posts" />}
                  />
                  <Route path="/posts">
                      <Route index element={<PostList />} />
                      <Route path="new" element={<PostCreate />} />
                      <Route path=":id" element={<PostShow />} />
                      <Route path=":id/edit" element={<PostEdit />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="new" element={<CategoryCreate />} />
                      <Route path=":id" element={<CategoryShow />} />
                      <Route path=":id/edit" element={<CategoryEdit />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route
                      path="/login"
                      element={
                        <AuthPage
                          type="login"
                          formProps={{
                            defaultValues: {
                              email: "eva@enmlegal.com",
                              password: "demodemo",
                            },
                          }}
                        />
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={<AuthPage type="forgotPassword" />}
                    />
                    <Route
                      path="/update-password"
                      element={<AuthPage type="updatePassword" />}
                    />
                  </Route>
              </Routes>
            </Refine>
        </RefineSnackbarProvider>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;
