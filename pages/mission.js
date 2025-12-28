// pages/mission.js
"use client";
import Image from "next/image";


import Head from "next/head";
import { useEffect, useState } from "react";

// шрифти для кастомного останнього блоку
import { playfair, garamond } from "@/lib/fonts";

// Content (array of { id, title, paras })
import SECTIONS from "@/components/mission page/missionSections";

// Components
import MissionHero from "@/components/mission page/MissionHero";
import MissionSection, {
  LottieLoop,
} from "@/components/mission page/MissionSection";

/** Read current site-header height so the hero sits under it. */
function useHeaderHeight(selector = "#site-header") {
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = document.querySelector(selector);
    const measure = () => {
      const next = el ? Math.round(el.getBoundingClientRect().height) : 0;
      setH((prev) => (prev !== next ? next : prev));
    };
    measure();
    const ro = el ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selector]);
  return h;
}

// Optional: map Lottie per section id
const LOTTIES = {
  traveler: "/animations/traveller_anim 1.json",
  crisis: "/animations/crisis_anim.json",
  workshop: "/animations/workshop_anim.json",
  return: "/animations/return_anim.json",
};

export default function MissionPage() {
  const headerH = useHeaderHeight();

  // усі секції, крім останньої
  const mainSections = SECTIONS.slice(0, -1);
  // остання секція ("Повернення до себе")
  const lastSection = SECTIONS[SECTIONS.length - 1];

  return (
    <>
      <Head>
        <title>Місія — Viator</title>
        <meta
          name="description"
          content="Viator: мандрівник, криза мислення, майстерня мислення, повернення до себе."
        />
      </Head>

      <main className="min-h-screen text-justify">
        
        {/* Keep hero just under fixed header */}
        <div style={{ height: headerH }} aria-hidden />

        {/* HERO */}
        <section id="mission-hero" className="relative">
          <MissionHero headerHeight={headerH} />
        </section>

        {/* ПЕРШІ СЕКЦІЇ (звичайний лейаут) */}
        <div className="w-full">
          {mainSections.map((s, i) => (
            <MissionSection
              key={s.id || i}
              id={s.id}
              title={s.title}
              paras={s.paras}
              lottieSrc={LOTTIES[s.id] || "/animations/traveller_anim 1.json"}
              flip={i % 2 === 1}
            />
          ))}
        </div>

        {/* ОСТАННЯ СЕКЦІЯ: текст по центру + лотті знизу по центру */}
        {lastSection && (
          <section
            id={lastSection.id}
            className="py-10 md:py-16 bg-[#F7F3EC]"
          >
            <div className="container max-w-4xl mx-auto px-6 text-center"> 
              {/* Заголовок */}
              <h2
                className={`${garamond.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472] mb-6`}
              >
                {lastSection.title}
              </h2>

              {/* Текст */} 
              <div
                className={`${playfair.className} space-y-4 md:space-y-5 text-lg md:text-xl leading-relaxed text-justify md:text-center`}
              >
                {lastSection.paras.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Центрована Lottie під текстом */}
              <div className="mt-10 mx-auto max-w-xl">
  <div
    className="w-full mx-auto relative"
    style={{
      height: "clamp(320px, 34vh, 420px)",
      aspectRatio: "4 / 3",
    }}
  >
    <Image
      src={"/imgs/return anim.svg"}
      alt={"Illustration"}
      fill
      className="object-contain"
      priority={false}
    />
  </div>
</div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
