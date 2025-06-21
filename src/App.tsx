import axios from "axios";

import { BrowserRouter, Outlet} from "react-router";
import "./App.css";

import { Layout } from "./components/layout";

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

function App() {

  return (
    <BrowserRouter>
      <Layout>
        <Outlet />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
