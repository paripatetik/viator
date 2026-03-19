// pages/mission.js
"use client";
import Image from "next/image";
import Head from "next/head";
import { useHeaderHeight } from "@/lib/hooks/useHeaderHeight";
import { playfair, garamond } from "@/lib/fonts";
import SECTIONS from "@/components/mission page/missionSections";
import MissionHero from "@/components/mission page/MissionHero";
import MissionSection from "@/components/mission page/MissionSection";

const LOTTIES = {
  traveler: "/animations/traveller_anim 1.json",
  crisis: "/animations/crisis_anim.json",
  workshop: "/animations/workshop_anim.json",
  return: "/animations/return_anim.json",
};

export default function MissionPage() {
  // needed only for MissionHero parallax calculations
  const headerH = useHeaderHeight();

  const mainSections = SECTIONS.slice(0, -1);
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
        {/* spacer uses CSS variable — no JS flash */}
        <div style={{ height: "var(--header-h)" }} aria-hidden />

        <section id="mission-hero" className="relative">
          <MissionHero headerHeight={headerH} />
        </section>

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

        {lastSection && (
          <section
            id={lastSection.id}
            className="py-10 md:py-16 bg-[#F7F3EC] text-justify"
          >
            <div className="container max-w-4xl mx-auto px-6 text-justify">
              <h2
                className={`${garamond.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472] mb-6`}
              >
                {lastSection.title}
              </h2>

              <div
                className={`${playfair.className} space-y-4 md:space-y-5 text-lg md:text-xl leading-relaxed text-justify`}
              >
                {lastSection.paras.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

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