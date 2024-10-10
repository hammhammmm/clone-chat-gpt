import "./globals.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatGPT Clone",
  description: "A ChatGPT using Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg antialiased`}>
        <Providers>
          <div className=" flex flex-col justify-between min-h-screen">
            <div className="mb-auto">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
