import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/app/ReactQueryProvider";
import { Inter } from "next/font/google";
import { Bounce, ToastContainer } from "react-toastify";

// We no longer need to import the default styles since we're using custom styles
// import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MeuTreino",
    description: "",
    viewport: {
        width: 'device-width',
        initialScale: 1,
        minimumScale: 1,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReactQueryProvider>
            <html lang="en" className={inter.className}>
                <body className="bg-zinc-900 text-zinc-100">
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
