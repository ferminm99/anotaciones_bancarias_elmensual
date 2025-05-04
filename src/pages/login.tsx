"use client";
import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { login, validateToken } from "@/app/services/api";
import { useRouter } from "next/router";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // 1) Si ya hay token en localStorage, lo validamos una sola vez al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken()
        .then((isValid) => {
          if (isValid) {
            // token válido → vamos al home
            router.replace("/");
          }
        })
        .catch(() => {
          // si da error, dejamos que el usuario se loguee
        });
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const token = await login(username, password);
      localStorage.setItem("token", token);
      router.replace("/"); // redirigimos al home
    } catch {
      setErrorMessage("Usuario o contraseña incorrectos");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 360,
        mx: "auto",
        mt: 8,
      }}
    >
      <Typography variant="h5" align="center">
        Iniciar sesión
      </Typography>
      <TextField
        label="Usuario"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <TextField
        label="Contraseña"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {errorMessage && (
        <Typography color="error" align="center">
          {errorMessage}
        </Typography>
      )}
      <Button type="submit" variant="contained" color="primary">
        Entrar
      </Button>
    </Box>
  );
};

export default LoginPage;
