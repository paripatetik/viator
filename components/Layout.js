import Image from "next/image";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  const backgroundIcons = [
    {
      src: "/imgs/icons/owl.png",
      className: "viator-bg-icon viator-bg-icon-owl",
    },
    {
      src: "/imgs/icons/column.png",
      className: "viator-bg-icon viator-bg-icon-column",
    },
    {
      src: "/imgs/icons/books.png",
      className: "viator-bg-icon viator-bg-icon-books",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col flex-1"
      style={{ paddingTop: "var(--header-h, 4rem)" }}
    >
      <Header />
      <main className="viator-evening-page flex-1">
        <div className="viator-bg-icons" aria-hidden="true">
          {backgroundIcons.map((icon) => (
            <Image
              key={icon.src}
              src={icon.src}
              alt=""
              width={1254}
              height={1254}
              className={icon.className}
              loading="lazy"
            />
          ))}
        </div>
        <div className="viator-page-content">{children}</div>
      </main>
      <Footer />
    </div>
  );
}    
