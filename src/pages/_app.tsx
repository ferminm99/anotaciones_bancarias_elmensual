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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (router.pathname === "/login") {
      setIsAuthenticated(true);
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      jwt_decode(token);
      setIsAuthenticated(true);
      console.log(isAuthenticated);
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    } finally {
      setCheckingAuth(false);
    }
  }, [router.pathname, router]);

  // ⛔ Nunca renderices `null`. Esperá a terminar el chequeo.
  if (checkingAuth) return null;

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
