import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "@/components/AppProviders";
import Layout from "@/components/Layout";
import { defaultOgImage, siteName, siteUrl } from "@/lib/seo";
import "@/styles/globals.css";

const criticalLayoutCss = `
  :root {
    --header-h: 4rem;
    --hero-vh: 100vh;
    --hero-h: calc(var(--hero-vh) - var(--header-h));
  }

  @supports (height: 100svh) {
    :root {
      --hero-vh: 100svh;
      --hero-h: calc(var(--hero-vh) - var(--header-h));
    }
  }

  @media (min-width: 768px) {
    :root {
      --header-h: 5rem;
    }
  }

  html {
    scrollbar-gutter: stable;
  }
`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Viator - розвідки про філософію, науку та культуру",
    template: "%s - Viator",
  },
  description: "Розвідки про філософію, науку та культуру.",
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: siteUrl,
    siteName,
    title: "Viator - розвідки про філософію, науку та культуру",
    description: "Розвідки про філософію, науку та культуру.",
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viator - розвідки про філософію, науку та культуру",
    description: "Розвідки про філософію, науку та культуру.",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "KM7wDZ4JWp6L_P3zGNZQ6G0cMJ8eQLs1OUZ_oLylS-0",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="antialiased">
        <style
          id="critical-layout-vars"
          dangerouslySetInnerHTML={{ __html: criticalLayoutCss }}
        />
        <Script id="scroll-restoration" strategy="beforeInteractive">
          {`
            history.scrollRestoration = 'manual';
          `}
        </Script>
        <AppProviders>
          <Layout>{children}</Layout>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
