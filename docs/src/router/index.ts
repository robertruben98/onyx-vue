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

// Una ruta por componente documentado, todas a la MISMA pagina: la plantilla
// generica lee el id de la ruta y busca sus metadatos. No hay un modulo de
// pagina que pueda faltar.
const componentRoutes: RouteRecordRaw[] = COMPONENT_DOCS.map((doc) => ({
  path: `/components/${doc.id}`,
  name: `component-${doc.id}`,
  component: () => import("../pages/ComponentPage.vue"),
  props: { id: doc.id },
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
