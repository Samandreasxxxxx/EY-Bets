import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SimStateProvider } from "@/context/SimStateContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BetBall | Private Social Betting for Friends",
  description: "Voluntary social pools for friends playing physical games like Foosball and Table Tennis. Bet small, win bragging rights, and keep score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-dark-bg text-white flex flex-col antialiased">
        <SimStateProvider>
          {children}
        </SimStateProvider>
      </body>
    </html>
  );
}
