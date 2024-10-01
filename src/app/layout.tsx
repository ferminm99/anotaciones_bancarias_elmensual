// src/app/layout.tsx
import './globals.css';  // Asegúrate de importar los estilos globales

export const metadata = {
  title: 'App de Transacciones',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
