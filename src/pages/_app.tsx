// pages/_app.tsx
import { AppProps } from "next/app"; // Importamos el tipo correcto para los props de la aplicación
import "../app/globals.css"; // Asegúrate de ajustar la ruta si es necesario
import Sidebar from "../app/components/Layout/Sidebar"; // Importa el Sidebar

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Sidebar>
      <Component {...pageProps} />
    </Sidebar>
  );
}

export default MyApp;
