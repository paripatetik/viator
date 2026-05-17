import Link from "next/link";
import SocialLinks from "./SocialLinks";
import NavLinks from "./NavLinks";
import NewsletterForm from "./NewsletterForm";
import { layoutStyles } from "@/lib/styles";
import Image from "next/image";

/**
 * Site‑wide footer with newsletter form, logo, social links and legal nav.
 * The form is non‑functional – wire it to your provider (Mailchimp, Buttondown, etc.) later.
 */
export default function Footer() {
  const thisYear = new Date().getFullYear();
  return (
    <footer
      className="viator-footer text-[#1E2A32]"
      style={{
        background: "linear-gradient(180deg, #9EAFB7 0%, #637B88 34%, #36566A 68%, #10283D 100%)",
      }}
    >
      <div className={`${layoutStyles.pageCompact} relative z-10 py-10 gap-10`}>
        <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-10 w-full h-auto md:h-[96px] mb-10">
      {/* Logo link */}
      <Link href="/" className="flex items-center self-center shrink-0" aria-label="На головну">
  <Image
    src="/imgs/logo.png"
    alt="Viator logo"
    width={96}
    height={96}
    priority
    className="h-16 md:h-24 w-auto object-contain hover:opacity-90 transition-opacity animate-pulse"
  />
</Link>

      {/* Navigation links */}
      <div className="flex gap-2 text-center">
        <NavLinks variant="footer" />
        </div>
      </div>
        
      
       <div className="flex flex-col-reverse md:flex-row gap-10 justify-between md:items-start">

      
        <div className="bg-[#F7F3EC] text-[#1E2A32] p-4 rounded-lg shadow-[0_10px_28px_rgba(30,42,50,0.12)] ring-1 ring-[rgba(65,100,114,0.22)]">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
          Підписатися на Viator
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-lg">
          Корисна розсилка про філософію, науку та культуру. Статті, відео й подкасти
          щотижня – без спаму.
        </p>

        <NewsletterForm />   
      </div>
        
        <div className="flex justify-between text-[#1E2A32]">           {/* contact section */}

          <div>
            <a
              href="mailto:hello@viator.com.ua"
              className="text-2xl md:text-3xl font-bold hover:underline break-all text-nowrap text-[#F8FBFC] drop-shadow-sm"
            >
              hello@viator.com.ua
            </a>

            {/* socials */}
            <div className="mt-3">
              <SocialLinks variant="footer" />
            </div>
          </div>
         
        </div>

       </div>
         <div className="mt-12 md:mt-20  flex justify-between text-[#F2F7FA] items-center">
            
            <p>© {thisYear} Viator </p> <p> Powered By Reason </p>
          </div>
      </div>
    </footer>
  );
}
