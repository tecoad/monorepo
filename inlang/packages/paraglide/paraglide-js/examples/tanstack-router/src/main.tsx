import React from 'react'
import ReactDOM from 'react-dom/client'
import {
	RouterProvider,
	createRouteMask,
	createRouter,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const localizedRouteMask = createRouteMask({
	routeTree: routeTree,
	from: "/",
	to: "/about",
});

console.log(routeTree);

// Set up a Router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	routeMasks: [localizedRouteMask],
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}
