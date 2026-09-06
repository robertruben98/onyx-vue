import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { COMPONENT_DOCS } from "../registry";

// The three hand-written guide pages.
const guideRoutes: RouteRecordRaw[] = [
  {
    path: "/introduction",
    name: "introduction",
    component: () => import("../pages/IntroductionPage.vue"),
  },
  {
    path: "/installation",
    name: "installation",
    component: () => import("../pages/InstallationPage.vue"),
  },
  {
    path: "/theming",
    name: "theming",
    component: () => import("../pages/ThemingPage.vue"),
  },
];

// One route per registered component page, generated from the registry so the
// router never drifts from the pages on disk.
const componentRoutes: RouteRecordRaw[] = COMPONENT_DOCS.map((doc) => ({
  path: `/components/${doc.id}`,
  name: `component-${doc.id}`,
  component: doc.loader,
}));

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/introduction" },
  ...guideRoutes,
  ...componentRoutes,
  { path: "/:pathMatch(.*)*", redirect: "/introduction" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
