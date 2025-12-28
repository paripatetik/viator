import Link from "next/link";
import Image from "next/image";
import SocialLinks from "./SocialLinks";
import NavLinks from "./NavLinks";
import NewsletterForm from "./NewsletterForm";

/**
 * Site‑wide footer with newsletter form, logo, social links and legal nav.
 * The form is non‑functional – wire it to your provider (Mailchimp, Buttondown, etc.) later.
 */
export default function Footer() {
  const thisYear = new Date().getFullYear();
  return (
    <footer className="bg-[#FFAB5B]/90 text-white">
      <div className="container mx-auto px-4 py-10 gap-10  ">
        <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-10 w-full h-auto md:h-[96px] mb-10">
      {/* Logo link */}
      <Link href="/" className=" flex items-center self-center" aria-label="На головну">
        <Image
          src="/imgs/logo.png"
          alt="Viator logo"
          width={120}
          height={120}
          priority
          className="h-full w-auto max-h-full object-contain hover:opacity-90 transition-opacity animate-pulse"
        />
      </Link>

      {/* Navigation links */}
      <div className="flex gap-2 text-center">
        <NavLinks variant="footer" />
        </div>
      </div>
        
      
       <div className="flex flex-col-reverse md:flex-row gap-10 justify-between md:items-start">

      
        <div className="bg-[#FFF2DB] text-black p-4 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
          Підписатися на Viator
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-lg">
          Корисна розсилка про філософію, науку та культуру. Статті, відео й подкасти
          щотижня – без спаму.
        </p>

        <NewsletterForm />   
      </div>
        
        <div className="flex justify-between text-black">           {/* contact section */}

          <div>
            <a
              href="mailto:hello@viator.blog"
              className="text-2xl md:text-3xl font-bold hover:underline break-all text-nowrap "
            >
              hello@viator.blog
            </a>

            {/* socials */}
            <div className="mt-3">
              <SocialLinks variant="footer" />
            </div>
          </div>
         
        </div>

       </div>
         <div className="mt-12 md:mt-20  flex justify-between text-black items-center">          
            
            <p>© {thisYear} Viator </p> <p> Powered By Reason </p>
          </div>
      </div>
    </footer>
  );
}
