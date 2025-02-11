// @ts-nocheck

import {
  BrowserRouter,
  Links,
  MemoryRouter,
  Meta,
  Route,
  RouterProvider,
  Routes,
  Scripts,
  ScrollRestoration,
} from "react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import Counter from "./components/counter";
import Home from "./routes/home";
import Other from "./routes/other";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* testing state persistence between routes */}
        <Counter />

        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function createApp(args: {
  root: HTMLElement;
  router: "memory" | "browser";
}) {
  let router

  if (args.router === "memory") {
    router = createMemoryRouter(routes);
  } else {
    router = createBrowserRouter(routes);
  }

  ReactDOM.createRoot(args.root).render(
    <RouterProvider router={router}></RouterProvider>
  );

  return { router }
}
