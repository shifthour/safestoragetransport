import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeStorage · Smart Transport",
  description: "Smart vendor allocation for SafeStorage transport operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* The app is served under /safestorage-transport. Client code calls fetch("/api/…")
            as if at root; this shim prefixes those absolute requests with the base path.
            External (https://…) and already-prefixed URLs are left untouched. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){if(typeof window==="undefined")return;var b="/safestorage-transport";var f=window.fetch;window.fetch=function(u,o){try{if(typeof u==="string"&&u.charAt(0)==="/"&&u.charAt(1)!=="/"&&u.indexOf(b+"/")!==0){u=b+u;}}catch(e){}return f.call(this,u,o);};})();',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
