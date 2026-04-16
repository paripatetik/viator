import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col flex-1 bg-viator-paper"
      style={{ paddingTop: "var(--header-h, 4rem)" }}
    >
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}    
