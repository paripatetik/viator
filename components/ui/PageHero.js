import Image from "next/image";
import { garamond, playfair } from "@/lib/fonts";
import { cn, heroHeightStyle, heroImageBlurDataUrl, heroStyles } from "@/lib/styles";

export default function PageHero({
  title,
  subtitle,
  imgSrc,
  alt,
  overlayClassName = "bg-black/45",
  imageClassName = "object-cover object-top",
  contentClassName = "relative flex h-full flex-col items-center justify-between px-6 pt-6 pb-10 text-center",
  titleClassName = "",
  subtitleClassName = "",
}) {
  return (
    <section className={heroStyles.root} style={heroHeightStyle}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        priority
        placeholder="blur"
        blurDataURL={heroImageBlurDataUrl}
        sizes="100vw"
        className={imageClassName}
      />
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
  );
}
