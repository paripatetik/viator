// pages/about.js
import Image from "next/image";
import { useHeaderHeight } from "@/lib/hooks/useHeaderHeight";
import { playfair, garamond } from "@/lib/fonts";

export default function AboutPage() {
  const headerH = useHeaderHeight();
  return (
    <>
      {/* ===== HERO ===== */}
      <section
        className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden
                   md:left-0 md:right-0 md:ml-0 md:mr-0 md:w-full"
        style={{
          height: `calc(100dvh - ${headerH}px)`,
          marginTop: headerH,
        }}
      >
        <Image
          src="/imgs/banner-about 1.png"
          alt="Про нас — Viator"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative h-full">
          <div className="max-w-xl mx-auto h-full flex flex-col justify-between px-6 pt-6 pb-10">
            <h1
              className={`${playfair.className} text-center text-4xl font-extrabold tracking-wider uppercase md:text-6xl drop-shadow text-white`}
            >
              Про нас
            </h1>

            <p
              className={`${garamond.className} text-lg sm:text-xl lg:text-2xl text-center bg-black/70 p-2 text-white`}
            >
              Ми і наші пупси
            </p>
          </div>
        </div>
      </section>

      {/* ===== ОСНОВНИЙ ТЕКСТ ===== */}
      <main className="container max-w-4xl mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-16">
        {/* рамка + список «Віримо…» */}
        <section className="mx-auto space-y-10">
          {/* рамка */}
          <div className="rounded-[26px] border-8 border-[#FFF2DB] bg-[#94B4C1]/60 px-8 py-7 shadow-[0_10px_25px_rgba(0,0,0,0.03)]">
            <div
              className={`${garamond.className} text-[19px] lg:text-[22px] leading-relaxed space-y-4 text-justify`}
            >
              <p>
                Viator — це онлайн-простір про філософію, науку й культуру, де
                ми створюємо контент для тих, хто заражений допитливістю
                (чи бодай хоче підхопити таку болячку).
              </p>

              <p>
                За ним стоїть невеличка команда ентузіастів, об’єднаних
                інтересом до мислення.
              </p>
            </div>
          </div>

          {/* список */}
        <div className="relative mt-8 ">
  {/* вертикальна лінія, що з’єднує блоки по центру */}
  <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#C1D6E2]" />

  <ul className="space-y-4 relative">
    <BelieveItem index={1}>
      Віримо, що великі зміни починаються з малих кроків і невеликих
      спільнот, які поділяють одну пристрасть.
    </BelieveItem>

    <BelieveItem index={2}>
      Віримо, що в такі часи, як наш, вміння зупинитися й подумати є
      необхідністю, аби жити змістовно.
    </BelieveItem>

    <BelieveItem index={3}>
      Віримо, що наших однодумців не бракуватиме і що Viator
      зростатиме разом із ними.
    </BelieveItem>
  </ul>
</div>

        </section>

        {/* ===== КОМАНДА ===== */}
        <section className="container mx-auto space-y-8">
          <h2
            className={`${playfair.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472]`}
          >
            Ядро нашої команди
          </h2>

          <div className="space-y-8">
            <TeamMember
              name="Владислав Рашко"
              subtitle="Співзасновник · Джедай Феноменології"
              photoSrc="/imgs/vlad.jpg"
            >
              Магістр філософії. Фанат Едмунда Гуссерля, джедай феноменології.
              Крім неї, пише про етику, естетику, свідомість. Серед іншого,
              створює дизайни зображень та відео для Viator. Наразі служить у
              ЗСУ.
            </TeamMember>

            <TeamMember
              name="Саган Максим"
              subtitle="Співзасновник · Оптимістичний Скептик"
              // photoSrc="/imgs/team/maksym.jpg"
            >
              Магістр філософії. Перший загорівся ідеєю Viator. Автор дописів на
              теми проблем пізнання, науки, релігії та історії думки. Розробник
              та дизайнер сайту.
            </TeamMember>
          </div>
        </section>
      </main>
    </>
  );
}

function BelieveItem({ index, children }) {
  return (
    <li className="relative mt-10">
      {/* сама капсула */}
      <div className="relative rounded-[999px] border border-[#D4E5EE] bg-[#F5FAFE] px-8 py-4">
        {/* кружечок з номером, приклеєний до лівого борту й по центру по вертикалі */}
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#94B4C1] text-xs font-semibold text-white">
            {index}
          </div>
        </div>

        <p
          className={`${garamond.className} text-[18px] lg:text-[20px] leading-relaxed`}
        >
          {children}
        </p>
      </div>
    </li>
  );
}


/**
 * TeamMember тепер приймає необов’язкові photoSrc / photoAlt.
 */
function TeamMember({ name, subtitle, children, photoSrc, photoAlt }) {
  return (
    <article className="group flex flex-col md:flex-row items-start gap-5 md:gap-8 bg-[#FFF2DB] rounded-2xl p-6 lg:p-8 shadow-sm">
      <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 border-4 border-white rounded-full bg-[#94B4C1] flex-shrink-0 self-center md:self-start overflow-hidden">
        {photoSrc && (
          <Image
            src={photoSrc}
            alt={photoAlt || name}
            width={200}
            height={200}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        )}
      </div>

      <div
        className={`${garamond.className} text-[18px] lg:text-[20px] leading-relaxed`}
      >
        <h3
          className={`${playfair.className} text-2xl md:text-3xl font-extrabold mb-1`}
        >
          {name}
        </h3>
        {subtitle && (
          <p className="text-base md:text-lg text-slate-700 mb-3">{subtitle}</p>
        )}
        <p className="text-justify">{children}</p>
      </div>
    </article>
  );
}
