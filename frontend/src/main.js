import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import './assets/output.css'
/* En tu main.css o app.css principal */
import './assets/nextly-style.css';
/* Tus estilos existentes se mantienen en otro archivo */


const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
