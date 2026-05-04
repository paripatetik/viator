import Link from "next/link";
import { inter } from "@/lib/fonts";

export default function NavLinks({ variant = "desktop", onClick }) {
  const mainLinks = [
    { href: "/mission", label: "Наша місія" },
    { href: "/about", label: "Про нас" },
    { href: "/support", label: "Підтримати" },
  ];

  // База: спокійний кегль, акуратні ховери, видимий focus (a11y)
  const base =
    `${inter.className} text-slate-900/90 hover:text-slate-900 
     transition-colors duration-150 
     underline-offset-[6px] hover:underline decoration-slate-900/30 
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 rounded-sm`;

  if (variant === "desktop") {
    return (
      <nav className="hidden md:flex items-center gap-5 lg:gap-8 ml-2 mt-1">
        {mainLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`${base} text-[17px] lg:text-[20px] font-medium`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    );
  }

  if (variant === "drawer") {
    return (
      <nav className="flex flex-col items-start gap-4 text-3xl font-medium w-full max-w-sm">
        {mainLinks.map((l) => (
          <Link key={l.href} href={l.href} onClick={onClick} className={`${base} no-underline`}>
            {l.label}
          </Link>
        ))}
      </nav>
    );
  }

  if (variant === "footer") {
    const footerBase =
      `${inter.className} transition-colors duration-150 underline-offset-[6px] ` +
      "hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 rounded-sm";
    const footerLink = `${footerBase} text-lg md:text-lg font-bold text-[#F8FBFC] hover:text-white decoration-white/45 drop-shadow-sm`;

    return (
      <div className="flex flex-col gap-4 justify-center text-left">
        <nav className="flex flex-wrap md:gap-6 gap-3 flex-col md:flex-row">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className={footerLink}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return null;
}
