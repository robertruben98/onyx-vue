import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { COMPONENT_DOCS } from "../registry";
import { PATTERN_DOCS } from "../patterns/registry";

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

// Dos rutas por pattern: la pagina de la doc y el marco que esa pagina mete en
// un iframe. El marco pinta el pattern solo (`meta.bare`: sin barra lateral),
// asi que su `100vh` es el alto del iframe y no el de la ventana.
const patternRoutes: RouteRecordRaw[] = PATTERN_DOCS.flatMap((p) => [
  {
    path: `/patterns/${p.id}`,
    name: `pattern-${p.id}`,
    component: () => import("../pages/PatternPage.vue"),
    props: { id: p.id },
  },
  {
    path: `/patterns/${p.id}/frame`,
    name: `pattern-${p.id}-frame`,
    component: p.page,
    meta: { bare: true },
  },
]);

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/introduction" },
  ...guideRoutes,
  ...patternRoutes,
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
