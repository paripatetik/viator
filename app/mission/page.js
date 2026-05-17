import Image from "next/image";
import { playfair } from "@/lib/fonts";
import { cn, layoutStyles } from "@/lib/styles";
import SECTIONS from "@/components/mission page/missionSections";
import MissionHero from "@/components/mission page/MissionHero";
import MissionSection from "@/components/mission page/MissionSection";
import SectionHeading from "@/components/ui/SectionHeading";

const LOTTIES = {
  traveler: "/animations/traveller_anim 1.json",
  crisis: "/animations/crisis_anim.json",
  workshop: "/animations/workshop_anim.json",
  return: "/animations/return_anim.json",
};

export const metadata = {
  title: "Місія",
  description:
    "Viator: мандрівник, криза мислення, майстерня мислення, повернення до себе.",
};

export default function MissionPage() {
  const mainSections = SECTIONS.slice(0, -1);
  const lastSection = SECTIONS[SECTIONS.length - 1];

  return (
    <main className="min-h-screen text-justify">
      <section id="mission-hero" className="relative">
        <MissionHero />
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
          className="py-10 md:py-16 text-justify"
        >
          <div className={cn(layoutStyles.proseWide, "text-justify")}>
            <SectionHeading font="garamond" className="mb-6">
              {lastSection.title}
            </SectionHeading>

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
                  src="/imgs/return anim.svg"
                  alt="Illustration"
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
  );
}
