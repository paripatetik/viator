import { garamond } from "@/lib/fonts";
import { cn, layoutStyles, typeStyles } from "@/lib/styles";
import ImageActionLink from "@/components/ui/ImageActionLink";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Підтримати",
  description: "Підтримати Viator на Patreon або разовим донатом.",
};

export default function SupportPage() {
  return (
    <>
      <PageHero
        title="Підтримати"
        subtitle="Навіть Діоген мав свою бочку, Viator має свою банку."
        imgSrc="/imgs/banner-support.png"
        alt="Підтримати Viator"
      />

      <main className={cn(layoutStyles.page, layoutStyles.pageY, "space-y-16")}>
        <section
          className={cn(
            garamond.className,
            layoutStyles.proseNarrow,
            typeStyles.bodySerif,
            "space-y-4 text-justify"
          )}
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

        <section className="max-w-3xl p-2 ml-auto mr-auto mb-6">
          <SectionHeading className="mb-6">Стати патроном</SectionHeading>

          <div className="flex justify-center">
            <ImageActionLink
              href="https://www.patreon.com/viator"
              imgSrc="/imgs/icons/patreon1.png"
              alt="Підтримати Viator на Patreon"
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto space-y-5 mt-10">
          <SectionHeading className="mb-6">Підтримати разовим донатом</SectionHeading>

          <div className="flex flex-col gap-4 md:flex-row justify-center md:gap-6">
            <ImageActionLink
              href="https://privatbank.example.com"
              imgSrc="/imgs/icons/privat.png"
              alt="Підтримати через ПриватБанк"
              label="ПриватБанк"
            />
            <ImageActionLink
              href="https://monobank.example.com"
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
