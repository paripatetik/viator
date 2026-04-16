"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import NavLinks from "@/components/NavLinks";
import SocialLinks from "@/components/SocialLinks";
import { playfair } from '@/lib/fonts';

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);

  // Always start false — matches SSR output exactly.
  // Never read window.scrollY on mount: on production, the browser can briefly
  // restore a non-zero scroll position before useScrollRestoration resets it,
  // which causes a one-frame isSticky=true flash. Starting at false and only
  // updating on actual user scroll events eliminates the flash entirely.
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        id="site-header"
        className={[
          "fixed inset-x-0 top-0 z-40 overflow-hidden",
          "transition-[background-color,box-shadow,backdrop-filter] duration-300",
          isSticky
            ? "bg-viator-sky/95 backdrop-blur-md shadow-lg border-b border-black/10"
            : "bg-transparent backdrop-blur-0 shadow-none border-b border-transparent",
        ].join(" ")}
        style={{ height: "var(--header-h, 4rem)" }}
      >
        <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8 gap-7 md:gap-10">
          <Link href="/" className="flex h-full shrink-0 items-center gap-2 lg:gap-3">
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: "calc(var(--header-h, 4rem) * 0.8)",
                height: "calc(var(--header-h, 4rem) * 0.8)",
              }}
            >
              <Image
                src="/imgs/logo.png"
                alt="Viator logo"
                width={80}
                height={80}
                className="object-contain w-full h-full hover:animate-pulse"
                priority
              />
            </div>
            <span className={`${playfair.className} italic text-2xl md:text-3xl lg:text-[35px] font-bold leading-none tracking-tight whitespace-nowrap`}>
              Viator
            </span>
          </Link>
          <NavLinks variant="desktop" />
          <div className="ml-auto"><SocialLinks variant="header" /></div>
        </div>
      </header>

      {/* BURGER */}
      <button
        aria-label="Toggle mobile menu"
        onClick={toggle}
        className="md:hidden fixed top-0 right-4 sm:right-6 lg:right-8 w-14 z-[60] grid place-items-center"
        style={{ height: "var(--header-h, 4rem)" }}
      >
        <div className="relative w-9 h-[22px]">
          <span className={`absolute left-0 w-full h-[3px] bg-gray-900 rounded transition-transform duration-300 origin-center ${open ? "rotate-45 top-[9.5px]" : "top-0"}`} />
          <span className={`absolute left-0 top-[9.5px] w-full h-[3px] bg-gray-900 rounded transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute left-0 w-full h-[3px] bg-gray-900 rounded transition-transform duration-300 origin-center ${open ? "-rotate-45 top-[9.5px]" : "bottom-0"}`} />
        </div>
      </button>

      {/* DRAWER */}
      <aside className={`fixed inset-0 w-full h-full md:hidden z-50 bg-gradient-to-r from-slate-100 via-white to-slate-200 bg-opacity-95 backdrop-blur-md shadow-xl transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col items-center gap-8 px-6 py-10 h-full overflow-y-auto">
          <Image src="/imgs/logo.png" alt="Viator logo" width={140} height={140} className="animate-pulse" />
          <div className="relative w-full max-w-sm">
            <input
              type="search"
              placeholder="Search…"
              className="w-full border rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.65 4.65a7.5 7.5 0 0011.98 11.98z" />
            </svg>
          </div>
          <NavLinks variant="drawer" onClick={toggle} />
          <div className="mt-auto flex flex-col items-center gap-7 text-gray-700 text-3xl">
            <div className="flex gap-4 justify-center">
              <Mail size={28} />
              <a href="mailto:hello@viator.blog" className="text-black">hello@viator.blog</a>
            </div>
            <SocialLinks variant="drawer" />
          </div>
        </div>
      </aside>
    </>
  );
}
