import { Footer, Spacer } from "@/components";
import { SettingsProvider } from "@/lib/settings";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import "../styles/global.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        titleTemplate="%s - Parth Kabra"
        defaultTitle="Parth Kabra"
        description="Computer Science Student at Northeastern University"
        openGraph={{
          site_name: "ninest",
          type: "website",
        }}
        twitter={{
          handle: "@nn9st",
          site: "@nn9st",
          cardType: "summary_large_image",
        }}
      />
      <SettingsProvider>
        {/* <Navbar /> */}
        <div className="min-h-screen">
          <Component {...pageProps} />
        </div>
        <Spacer size="xl" />
        <Footer />
      </SettingsProvider>
    </>
  );
}

export default MyApp;
