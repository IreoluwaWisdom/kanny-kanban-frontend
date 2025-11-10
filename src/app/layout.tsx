import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BoardProvider } from "@/context/BoardContext";

export const metadata: Metadata = {
  title: "Kanny Kanban Board",
  description: "A fullstack Kanban board application",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <BoardProvider>
            {children}
          </BoardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
