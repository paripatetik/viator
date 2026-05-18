"use client";

import Image from "next/image";
import { useMemo, useRef, useEffect, useState, Fragment } from "react";
import { motion } from "framer-motion";
import { useHeaderHeight } from "@/lib/hooks/useHeaderHeight";
import { playfair, garamond } from "@/lib/fonts";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";

export default function AboutPageClient() {
  const headerH = useHeaderHeight();

  const beliefs = useMemo(
    () => [
      "Віримо, що великі зміни починаються з малих кроків і невеликих спільнот, які поділяють одну пристрасть.",
      "Віримо, що в такі часи, як наш, вміння зупинитися й подумати є необхідністю, аби жити змістовно.",
      "Віримо, що наших однодумців не бракуватиме і що Viator зростатиме разом із ними.",
    ],
    []
  );

  return (
    <>
      <PageHero
        title="Про нас"
        subtitle="Ми і наші пупси"
        imgSrc="/imgs/banner-about 1.png"
        backgroundPosition="center top"
        alt="Про нас — Viator"
        overlayClassName="bg-black/25"
        contentClassName="relative max-w-xl mx-auto h-full flex flex-col justify-between px-6 pt-6 pb-10"
      />

      <main className="container max-w-4xl mx-auto px-6 lg:px-10 py-12 lg:py-16 space-y-16">
        <section className="mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 42 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
            className="rounded-[26px] border-8 border-viator-cream bg-viator-sky/60 px-8 py-7 shadow-[0_10px_25px_rgba(0,0,0,0.03)]"
          >
            <div
              className={`${garamond.className} text-[19px] lg:text-[22px] leading-relaxed space-y-4 text-justify`}
            >
              <p>
                Viator — це онлайн-простір про філософію, науку й культуру, де ми
                створюємо контент для тих, хто заражений допитливістю (чи бодай
                хоче підхопити таку болячку).
              </p>

              <p>
                За ним стоїть невеличка команда ентузіастів, яка поділяє інтерес
                до мислення.
              </p>
            </div>
          </motion.div>

          <BelievePanel
            items={beliefs}
            headerOffset={headerH}
            garamondClassName={garamond.className}
          />
        </section>

        <section className="container mx-auto space-y-8" style={{ overflowX: "clip" }}>
          <SectionHeading>Ядро нашої команди</SectionHeading>

          <div className="space-y-8">
            <TeamMember
              from="left"
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
              from="right"
              name="Саган Максим"
              subtitle="Співзасновник · Оптимістичний Скептик"
              photoSrc="/imgs/max.png"
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

function BelievePanel({ items, headerOffset = 0, garamondClassName = "" }) {
  const sectionRef = useRef(null);
  const [t, setT] = useState(0);
  const n = Math.max(1, items.length);

  const stickyTop = Math.max(0, headerOffset + 18);

  const perStepVh = 95;
  const leadInVh = 16;
  const tailVh = 16;
  const driverH = 100 + leadInVh + Math.max(0, n - 1) * perStepVh + tailVh;

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return undefined;

    let raf = 0;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const measure = () => {
      raf = 0;

      const rect = sec.getBoundingClientRect();
      const pageY = window.scrollY || window.pageYOffset;
      const topY = pageY + rect.top;
      const startY = topY - stickyTop;
      const leadInPx = (leadInVh / 100) * window.innerHeight;
      const stepPx = (perStepVh / 100) * window.innerHeight;
      const y = pageY - startY;

      if (y <= leadInPx) {
        setT(0);
        return;
      }

      const raw = (y - leadInPx) / stepPx;
      setT(clamp(raw, 0, n - 1));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [n, stickyTop, perStepVh, leadInVh]);

  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push("auto");
    if (i < n - 1) rows.push("1fr");
  }
  const gridTemplateRows = rows.join(" ");

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${driverH}vh` }}>
      <div className="sticky" style={{ top: stickyTop }}>
        <div
          className="relative mx-auto w-full max-w-4xl rounded-[26px] bg-transparent overflow-hidden"
          style={{ height: `calc(100vh - ${stickyTop}px - 18px)` }}
        >
          <div className="relative z-10 h-full px-6 py-10">
            <div className="grid h-full items-center text-center" style={{ gridTemplateRows }}>
              {items.map((text, i) => (
                <Fragment key={i}>
                  <BelieveStackItem
                    index={i + 1}
                    i={i}
                    t={t}
                    garamondClassName={garamondClassName}
                  >
                    {text}
                  </BelieveStackItem>

                  {i < n - 1 && (
                    <div
                      aria-hidden
                      className="justify-self-center self-stretch w-[2px] rounded-full bg-viator-line/90"
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BelieveStackItem({ index, children, i, t, garamondClassName }) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const ad = Math.abs(i - t);
  const wLin = clamp(1 - ad, 0, 1);
  const w = wLin * wLin * (3 - 2 * wLin);

  const opacity = 0.22 + 0.78 * w;
  const blurPx = (1 - w) * 10;
  const scale = 0.985 + 0.02 * w;

  const active = w > 0.7;

  return (
    <motion.div
      style={{
        opacity,
        filter: `blur(${blurPx}px)`,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        willChange: "transform, filter, opacity",
      }}
      className="relative"
    >
      <div className="relative rounded-[999px] border border-viator-pale-border bg-viator-pale px-8 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white transition-colors duration-300",
              active ? "bg-viator-ink" : "bg-viator-sky",
            ].join(" ")}
          >
            {index}
          </div>
        </div>

        <p
          className={[
            garamondClassName,
            "leading-relaxed text-[19px] lg:text-[22px] transition-colors duration-300",
            active ? "text-slate-900" : "text-slate-700",
          ].join(" ")}
        >
          {children}
        </p>
      </div>
    </motion.div>
  );
}

function TeamMember({ name, subtitle, children, photoSrc, photoAlt, from = "left" }) {
  const x0 = from === "right" ? 64 : -64;

  return (
    <motion.article
      initial={{ opacity: 0, x: x0 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      className="group relative flex flex-col md:flex-row items-start gap-5 md:gap-8 overflow-hidden rounded-lg border border-[#AFC5CD] bg-[#FAFBF8]/82 p-6 shadow-[0_12px_30px_rgba(30,42,50,0.09)] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-[2px] before:bg-[#416472]/55 lg:p-8"
    >
      <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 border border-[#B9CBD3] ring-4 ring-white/70 rounded-full bg-[#DCE6E8] flex-shrink-0 self-center md:self-start overflow-hidden">
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

      <div className={`${garamond.className} relative z-10 text-[18px] lg:text-[20px] leading-relaxed`}>
        <h3 className={`${playfair.className} text-2xl md:text-3xl font-extrabold mb-1`}>
          {name}
        </h3>
        {subtitle && <p className="text-base md:text-lg text-slate-700 mb-3">{subtitle}</p>}
        <p className="text-justify">{children}</p>
      </div>
    </motion.article>
  );
}
