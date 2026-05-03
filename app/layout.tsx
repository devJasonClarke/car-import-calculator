import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jamaica Car Import Tax Calculator | Dev Jason Clarke",
  description:
    "Free Jamaica vehicle import cost calculator for cars, SUVs, pickups, hybrids, trucks, and EVs. Calculate CIF value, import duties, GCT, SCTA, and all fees with real-time USD to JMD conversion. Built by Dev Jason Clarke.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Inline script sets the .dark class before first paint — eliminates flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||t===null)document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
