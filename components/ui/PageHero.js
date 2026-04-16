import { garamond, playfair } from "@/lib/fonts";
import { cn, heroHeightStyle, heroStyles } from "@/lib/styles";

export default function PageHero({
  title,
  subtitle,
  imgSrc,
  overlayClassName = "bg-black/45",
  contentClassName = "relative flex h-full flex-col items-center justify-between px-6 pt-6 pb-10 text-center",
  titleClassName = "",
  subtitleClassName = "",
}) {
  return (
    <>
      <link rel="preload" as="image" href={imgSrc} fetchPriority="high" />
      <section
        className={heroStyles.root}
        style={{
          ...heroHeightStyle,
          backgroundImage: `url("${imgSrc}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#111",
        }}
      >
        <div className={cn("absolute inset-0", overlayClassName)} />

        <div className={contentClassName}>
          <h1 className={cn(playfair.className, heroStyles.title, titleClassName)}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(garamond.className, heroStyles.subtitle, subtitleClassName)}>
              {subtitle}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
