// Si estamos en desarrollo, lo decide el bundler del CONSUMIDOR, no el build de
// la libreria.
//
// `import.meta.env.DEV` no sirve aqui: en modo libreria Vite lo sustituye por
// `false` al construir `dist`, y los avisos desaparecian del paquete — quien
// instala el tgz no los veia nunca, tampoco en `vite dev`. `process.env.NODE_ENV`
// Vite lo deja intacto en una libreria, y el bundler de la app lo sustituye
// ("development" / "production"), asi que en produccion el aviso se pliega a
// `false` y el minificador lo quita. Es el mismo contrato que usa Vue.
//
// El try cubre el build UMD cargado sin bundler, donde `process` no existe: ahi
// no hay forma de saberlo, y lo seguro es callar.
declare const process: { env: { NODE_ENV?: string } };

/** True unless the consumer's build says `production`. */
export function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}
