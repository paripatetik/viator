import { garamond } from "@/lib/fonts";
import { cn, layoutStyles, typeStyles } from "@/lib/styles";
import ImageActionLink from "@/components/ui/ImageActionLink";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Підтримати",
  description:
    "Підтримати Viator на Patreon або разовим донатом і допомогти розвивати філософський контент українською.",
  path: "/support",
  image: "/imgs/banner-support.png",
});

export default function SupportPage() {
  return (
    <div className="viator-support-page">
      <PageHero
        title="Підтримати"
        subtitle="Навіть Діоген мав свою бочку, Viator має свою банку."
        imgSrc="/imgs/banner-support.png"
        backgroundPosition="center top"
        alt="Підтримати Viator"
      />

      <main className={cn(layoutStyles.page, "pt-10 pb-8 lg:pt-12 lg:pb-10 space-y-10 lg:space-y-12")}>
        <section
          className={cn(
            garamond.className,
            layoutStyles.proseNarrow,
            typeStyles.bodySerif,
            "space-y-4 text-justify"
          )}
        >
          <p>
            Щоб підтримувати Viator у теперішньому вигляді, потрібні час,
            увага й ресурси: для сайту, текстів, дизайну, технічної підтримки
            та регулярної роботи над матеріалами.
          </p>
          <p>
            Поки ми не хочемо обіцяти більше, ніж можемо виконати. Підтримка
            насамперед допомагає зберігати те, що вже є, і поступово створювати
            умови для розвитку.
          </p>
          <p>
            У майбутньому ми хочемо залучати нових авторів, проводити події та
            розвивати Viator як ширшу інтелектуальну спільноту. Патрони матимуть
            прямий стосунок до цього розвитку.
          </p>
        </section>

        <section className="max-w-3xl p-2 mx-auto">
          <SectionHeading className="mb-6">Стати патроном</SectionHeading>

          <div className="flex justify-center">
            <ImageActionLink
              href="https://www.patreon.com/viator"
              imgSrc="/imgs/icons/patreon1.png"
              alt="Підтримати Viator на Patreon"
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto space-y-5">
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
    </div>
  );
}
