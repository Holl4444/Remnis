import type { Metadata } from "next";
import RegisterSW from "./components/RegisterSW";
import { Cabin_Sketch, Nunito } from "next/font/google";
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import "./globals.css";

const cabinSketch = Cabin_Sketch({
  variable: "--font-cabin-sketch",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Remnis',
  description: 'Memory collation',
  icons: {
    icon: '/peach-cloud192x192.png', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/peach-cloud192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${cabinSketch.variable} ${nunito.variable}`}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
