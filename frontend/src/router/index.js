import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CameraCaptureView from "../views/CameraCaptureView.vue";
import CreatePostView from "../views/CreatePostView.vue";
import MapView from "../views/MapView.vue";
import rankingView from "../views/RankingView.vue";
import profileView from "../views/ProfileView.vue";
import loginView from "../views/LoginView.vue";
import logoutView from "../views/LogoutView.vue";
import signinView from "../views/SigninView.vue";
import { useAuth } from "@/hooks/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/cameraCapture",
      name: "cameraCapture",
      component: CameraCaptureView,
    },
    {
      path: "/createPost",
      name: "createPost",
      component: CreatePostView,
    },
    {
      path: "/map",
      name: "map",
      component: MapView,
    },
    {
      path: "/ranking",
      name: "ranking",
      component: rankingView,
    },
    {
      path: "/profile",
      name: "profile",
      component: profileView,
    },
    {
      path: "/login",
      name: "login",
      component: loginView,
    },
    {
      path: "/logout",
      name: "logout",
      component: logoutView,
    },
    {
      path: "/signin",
      name: "signin",
      component: signinView,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login", "/signin"];
  const authRequired = !publicPages.includes(to.path);
  const { isAuthenticated } = useAuth();
  
  if (authRequired && !isAuthenticated) {
    return next("/login");
  }
  next();
});

export default router;
