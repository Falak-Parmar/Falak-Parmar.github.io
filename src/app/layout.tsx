import type { Metadata } from "next";
import Script from "next/script";

import "@/styles/style.css";
import "@/styles/common/no-cursor.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Cursor from "@/components/Cursor";

export const metadata: Metadata = {
  title: "Falak Parmar",
  description:
    "Data Scientist bridging the gap between some physics, some applied machine learning and some swift development.",
  metadataBase: new URL("https://sameerasw.com/"), // or whatever baseline they want, let's keep it or make it general
  keywords:
    "Falak Parmar, Falak-Parmar, Data Science, Quantum Machine Learning, Physics, Portfolio",
  openGraph: {
    type: "article",
    title: "Falak Parmar - Personal Space",
    description:
      "Data Scientist bridging the gap between some physics, some applied machine learning and some swift development.",
    url: "https://sameerasw.com/",
    images: [
      {
        url: "/assets/img/web-preview.png",
        width: 1920,
        height: 1080,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Falak Parmar",
    description:
      "Data Scientist bridging the gap between some physics, some applied machine learning and some swift development.",
    images: ["/assets/img/web-preview.png"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,wdth,ROND@6..144,1..1000,100..150,0..100&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,200"
          as="style"
        />

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />

        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="f35df0a1-95c5-4edf-b397-46a6071914f7"
          strategy="beforeInteractive"
        />
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6F3G1NW62X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6F3G1NW62X');
          `}
        </Script>
      </head>
      <body>
        <Cursor />
        {children}
      </body>
    </html>
  );
}
