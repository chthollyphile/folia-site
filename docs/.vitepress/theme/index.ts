import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { MotionPlugin } from "@vueuse/motion";
import FoliaHome from "./components/FoliaHome.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(MotionPlugin);
    app.component("FoliaHome", FoliaHome);
  }
} satisfies Theme;
