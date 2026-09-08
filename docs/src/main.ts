import { createApp, type Component } from "vue";
import App from "./App.vue";
import { router } from "./router";

// Importar el indice de la libreria una vez arrastra la hoja de tokens (el
// indice importa su CSS), asi que la app de documentacion tiene el tema gratis.
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
