import "./style.css";

import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import vue3GoogleLogin from "vue3-google-login";

import App from "./App.vue";
import createIcons from "./plugins/iconPlugin";
import en from "./translations/en.json";
import vi from "./translations/vi.json";

const i18n = createI18n({
  locale: "en",
  legacy: false,
  fallbackLocale: "en",
  messages: { vi, en },
});

const app = createApp(App);

app.use(createIcons);
app.use(i18n);
app.use(vue3GoogleLogin, {
  clientId: "519228911939-cri01h55lsjbsia1k7ll6qpalrus75ps.apps.googleusercontent.com",
});
app.mount("#app");
