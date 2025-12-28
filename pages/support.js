// pages/support.js
import Image from "next/image";
import Link from "next/link";
import { useHeaderHeight } from "@/lib/hooks/useHeaderHeight";
import { playfair, garamond } from "@/lib/fonts";

export default function SupportPage() {
  const headerH = useHeaderHeight();

  return (
    <>
      {/* ===== HERO / БАНЕР НА ВЕСЬ ЕКРАН ===== */}
      <section
        className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden
                   md:left-0 md:right-0 md:ml-0 md:mr-0 md:w-full px-6 pt-6 pb-10"
        style={{
          height: `calc(100dvh - ${headerH}px)`,
          marginTop: headerH,
        }}
      >
        <Image
          src="/imgs/banner-support.png" // поклади сюди свій banner-support
          alt="Підтримати Viator"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative flex h-full flex-col items-center justify-between px-6 text-center">
          <h1
            className={`${playfair.className} text-center text-4xl font-extrabold tracking-wider uppercase md:text-6xl drop-shadow text-white`}
          >
            Підтримати
          </h1>
          <p
            className={`${garamond.className} text-lg sm:text-xl lg:text-2xl text-center bg-black/70 p-2 text-white`}
          >
            Навіть Діоген мав свою бочку, Viator має свою банку.
          </p>
        </div>
      </section>

      {/* ===== ОСНОВНИЙ КОНТЕНТ ===== */}
      <main className="container mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-16">
        {/* вступний текст */}
        <section
          className={`${garamond.className} max-w-3xl mx-auto text-[19px] lg:text-[22px] leading-relaxed space-y-4 text-justify`}
        >
          <p>
            Наша команда витрачає власний час та ресурси, аби робити
            філософський контент доступним.
          </p>
          <p>
            Будь-яка допомога дозволить нам робити нашу справу більше й краще.
          </p>
          <p>
            Ви можете стати нашим патроном на Patreon і отримати доступ до
            ексклюзивних матеріалів: заглянути за лаштунки Viator, читати
            додатковий контент та впливати на вибір тем для майбутніх дописів.
          </p>
        </section>

        {/* Patreon */}
        <section className="max-w-3xl p-2 ml-auto mr-auto mb-6">
          <h2
            className={`${playfair.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472] mb-6`}
          >
            Стати патроном
          </h2>

          <div className="flex justify-center">
            <SupportButton
              href="https://www.patreon.com/viator" // заміниш на свій URL
              imgSrc="/imgs/icons/patreon1.png" // зображення-кнопка Patreon
              alt="Підтримати Viator на Patreon"
            />
          </div>
        </section>

        {/* Разові донати */}
        <section className="max-w-3xl mx-auto space-y-5 mt-10">
           <h2
            className={`${playfair.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472] mb-6`}
          >
            Підтримати разовим донатом
          </h2>

          <div className="flex flex-col gap-4 md:flex-row justify-center md:gap-6">
            <SupportButton
              href="https://privatbank.example.com" // сюди твій лінк
              imgSrc="/imgs/icons/privat.png"
              alt="Підтримати через ПриватБанк"
              label="ПриватБанк"
            />
            <SupportButton
              href="https://monobank.example.com" // і сюди
              imgSrc="/imgs/icons/monobank.jpeg"
              alt="Підтримати через Monobank"
              label="Monobank"
            />
          </div>
        </section>
      </main>
    </>
  );
}

/**
 * Кнопка-посилання з «зображенням посилання».
 * imgSrc → будь-який банер/іконка, що лежить у /public/image/…
 */
function SupportButton({ href, imgSrc, alt, label }) {
  return (
    <Link
      href={href}
      className="inline-flex flex-col items-center group"
      target="_blank"
      rel="noreferrer"
    >
      <div className="relative w-58 h-22 md:w-64 lg:w-70 rounded-md overflow-hidden shadow-md ring-1 ring-black/5 group-hover:scale-[1.02] group-hover:shadow-lg transition">
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-cover object-center h-[100%] bg-white p-2 rounded-md"
        />
      </div>
      {label && (
        <span
          className={`${garamond.className} mt-2 text-sm md:text-base text-slate-700`}
        >
          {label}
        </span>
      )}
    </Link>
  );
}
