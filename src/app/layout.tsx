import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/app/ReactQueryProvider";
import { Inter } from "next/font/google";
import { Bounce, ToastContainer } from "react-toastify";

// We no longer need to import the default styles since we're using custom styles
// import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
    title: "MeuTreino - Registre seus treinos facilmente",
    description: "Aplicativo para registro e acompanhamento de treinos de academia de forma simples e intuitiva",
    applicationName: "MeuTreino",
    authors: [{ name: "MeuTreino Team" }],
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    userScalable: false,
    colorScheme: 'dark',
    themeColor: '#18181b', // zinc-900 - mesma cor do fundo da aplicação
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReactQueryProvider>
            <html lang="pt-BR" className={`${inter.className} h-full`}>
                <body className={`h-full antialiased`}>
                    {children}
                    <ToastContainer
                        position="top-right"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                        transition={Bounce}
                        limit={3}
                        className="toast-container"
                    />
                </body>
            </html>
        </ReactQueryProvider>
    );
}
