import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./Layout";
import { CateringSchedulerView } from "./views/CateringSchedulerView";
import { FoodItemsView } from "./views/FoodItemsView";
import { LoginView } from "./views/LoginView";
import { UpcomingEventsView } from "./views/UpcomingEventsView";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginView },
  {
    path: "/",
    Component: Layout,
    loader: () => (sessionStorage.getItem("preview-signed-in") ? null : redirect("/login")),
    children: [
      { index: true, Component: CateringSchedulerView },
      { path: "food-items", Component: FoodItemsView },
      { path: "upcoming", Component: UpcomingEventsView },
    ],
  },
]);
