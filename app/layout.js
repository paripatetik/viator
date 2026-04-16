import Script from "next/script";
import AppProviders from "@/components/AppProviders";
import Layout from "@/components/Layout";
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
  title: {
    default: "Viator",
    template: "%s - Viator",
  },
  description: "Розвідки про філософію, науку та культуру.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
      </body>
    </html>
  );
}
