import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.tsx";
import React from "react";
import { store } from "./config/redux/store/store.ts";
import AuthLoader from "./AuthLoader.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryConfig/queryOptions.ts";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
      <AuthLoader>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthLoader>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
