import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#111111" />

        {/* Preload fonts */}
        <link
          rel="preload"
          href="/fonts/karla.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        <link rel="stylesheet" href="/fonts/font.css" />
      </Head>
      {/* Defaults: theme and text color */}
      <body className="bg-light text-gray-dark" data-theme="light">
        <Main />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.body.dataset.theme = JSON.parse(localStorage.getItem("settings"))?.theme || "light"`,
          }}
        ></script>
        <NextScript />
      </body>
    </Html>
  );
}
