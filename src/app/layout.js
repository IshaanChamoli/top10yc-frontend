import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseInitializer } from './components/FirebaseInitializer';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Top 10 YC",
  description: "Find YOUR top 10 YC companies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseInitializer />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
