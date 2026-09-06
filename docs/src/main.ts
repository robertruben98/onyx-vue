import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

// Importing the library entry once pulls in the token stylesheet (the library
// index imports its CSS), so the docs app gets the theme variables for free.
import "@onyx/vue";

createApp(App).use(router).mount("#app");
