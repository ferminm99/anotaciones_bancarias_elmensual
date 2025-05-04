// pages/_app.tsx
"use client";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { CacheProvider } from "@/lib/CacheContext";
import Sidebar from "@/app/components/Layout/Sidebar";
import "@/app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Si estoy en la pantalla de login, me salto la validación
    if (router.pathname === "/login") {
      setIsAuthenticated(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      jwt_decode(token); // Lanzará si el token no es válido
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router.pathname, router]);

  // Mientras no sepamos si está autenticado, no renderizamos nada
  if (!isAuthenticated) return null;

  if (router.pathname === "/login") {
    return <Component {...pageProps} />;
  }

  return (
    <CacheProvider>
      <Sidebar>
        <Component {...pageProps} />
      </Sidebar>
    </CacheProvider>
  );
}

export default MyApp;
