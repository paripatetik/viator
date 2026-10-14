import { garamond, inter, playfair } from "@/lib/fonts";
import { cn, layoutStyles, typeStyles } from "@/lib/styles";
import PageHero from "@/components/ui/PageHero";
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

        <section
          aria-label="Способи підтримки Viator"
          className={cn(inter.className, layoutStyles.proseNarrow, "grid gap-5 pb-4 md:grid-cols-2")}
        >
          <div className="flex flex-col rounded-2xl border border-white/65 bg-[#F7F8F5] p-6">
            <h2 className={cn(playfair.className, "viator-support-option-title text-[26px] font-medium leading-tight tracking-tight text-[#243D46] sm:text-[30px]")}>
              Стати патроном
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#53666C]">
              Допомагайте Viator працювати над новими текстами та поступово розвивати спільноту.
            </p>
            <div className="mt-auto pt-6">
              <a
                href="https://www.patreon.com/viator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center rounded-xl bg-[#416472] px-4 py-3.5 text-center text-[15px] font-medium text-white transition-colors hover:bg-[#345361] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#416472]"
              >
                Перейти на Patreon
              </a>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-white/65 bg-[#F0F4F3] p-6">
            <h2 className={cn(playfair.className, "viator-support-option-title text-[26px] font-medium leading-tight tracking-tight text-[#243D46] sm:text-[30px]")}>
              Разовий внесок
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#53666C]">
              Підтримайте сайт і роботу над матеріалами внеском комфортного для вас розміру.
            </p>
            <div className="mt-auto grid gap-3 pt-6 min-[400px]:grid-cols-2">
              {[
                { label: "ПриватБанк", href: "https://privatbank.example.com" },
                { label: "Monobank", href: "https://monobank.example.com" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Підтримати через ${label}`}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-[#C5D3D6] bg-white/60 px-3 py-3.5 text-center text-[14px] font-medium text-[#243D46] transition-colors hover:border-[#7E9AA4] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#416472]"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
