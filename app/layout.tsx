import type { Metadata } from "next";
import { Yatra_One, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const yatraOne = Yatra_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-yatra",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Baarish",
  description: "A rainy-evening music player",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${yatraOne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
