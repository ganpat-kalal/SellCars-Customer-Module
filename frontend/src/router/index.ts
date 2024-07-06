import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import LoginView from "../views/LoginView.vue";
import CustomersView from "../views/CustomersView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: CustomersView,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/customers-page",
    name: "Customers",
    component: CustomersView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated
  ) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
