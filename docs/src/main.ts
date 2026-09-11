import { createApp, type Component } from "vue";
import App from "./App.vue";
import { router } from "./router";

// El paquete COMPLETO de estilos, y aqui si esta justificado: este sitio tiene
// un selector de preset y los ofrece los cuatro. Una pagina que use uno solo
// importa `styles/base.css` mas el suyo.
import "@onyx/vue/styles/index.css";
import * as onyx from "@onyx/vue";

// Cromo del sitio: fuente, fondo y tipografia de la pagina.
import "./styles.css";

const app = createApp(App);

// Cada demo es una plantilla compilada en caliente, y una plantilla no puede
// importar nada: los componentes tienen que estar registrados globalmente para
// que `<UiButton>` signifique algo dentro de ella.
for (const [nombre, exportado] of Object.entries(onyx)) {
  if (nombre.startsWith("Ui")) app.component(nombre, exportado as Component);
}

app.use(router).mount("#app");
