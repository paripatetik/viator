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

    const footerLink = `${base} text-lg md:text-lg font-bold`; 
    const footerLegal = `${base} text-lg md:text-base font-normal`;


    return ( <div className="flex flex-col gap-4 text-black justify-center text-left"> {/* Primary nav */} <nav className="flex flex-wrap md:gap-6 gap-3 flex-col md:flex-row "> {mainLinks.map((l) => ( <Link key={l.href} href={l.href} className={footerLink}> {l.label} </Link> ))} </nav> {/* <nav className="flex flex-wrap gap-6"> {legalLinks.map((l) => ( <Link key={l.href} href={l.href} className={${footerLink} text-black/85 font-normal} > {l.label} </Link> ))} </nav> */} </div> ); }

  return null;
}

