// Importa BootstrapVueNext y los estilos CSS
import { createBootstrap } from 'bootstrap-vue-next';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import '@fortawesome/fontawesome-free/css/all.css';

// Crea y monta la aplicación Vue
const app = createApp(App);
app.use(createBootstrap()); // Usa el nuevo método de creación
app.use(createPinia());
app.use(router);
app.mount('#app');