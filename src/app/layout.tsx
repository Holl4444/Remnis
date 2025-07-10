import type { Metadata } from "next";
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
  // icons: {
  //   icon: '/favicon.svg', 
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cabinSketch.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
