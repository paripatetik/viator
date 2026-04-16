import Script from "next/script";
import AppProviders from "@/components/AppProviders";
import Layout from "@/components/Layout";
import "@/styles/globals.css";

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
