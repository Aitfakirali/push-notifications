import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#000000" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My PWA App" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
