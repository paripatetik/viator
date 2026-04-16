import Image from "next/image";
import { Clock } from "lucide-react";
import {
  accentStyles,
  heroHeightStyle,
  heroImageBlurDataUrl,
  heroStyles,
} from "@/lib/styles";

export function Hero({
  title,
  author,
  date,
  readingTime,
  img,
  epigraph,
}) {
  return (
    <section className={heroStyles.root} style={heroHeightStyle}>
      <Image
        src={img}
        alt=""
        fill
        priority
        placeholder="blur"
        blurDataURL={heroImageBlurDataUrl}
        sizes="100vw"
        className="object-cover object-center md:object-[50%_20%]"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative flex h-full flex-col justify-end">
        <div className="container relative mx-auto px-6 pb-14 text-white">
          <h1
            className="font-extrabold leading-tight text-3xl sm:text-5xl md:text-6xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div className={accentStyles.shortRule} />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
            {epigraph && (
              <blockquote
                className="max-w-2xl italic text-lg text-white/90 sm:mr-4"
                dangerouslySetInnerHTML={{ __html: epigraph }}
              />
            )}
          </div>

          <p
            className="
              absolute bottom-6 left-6 right-6
              flex items-center gap-2 justify-start
              text-white/80 whitespace-nowrap
              sm:static sm:mt-6 sm:justify-end
            "
          >
            {author && <span>{author}</span>}
            {author && date && <span className="mx-1">|</span>}
            {date && <span>{date}</span>}
            {(author || date) && readingTime && <span className="mx-1">|</span>}
            {readingTime && (
              <>
                <Clock size={16} strokeWidth={2} className="-mt-[2px]" />
                <span>{readingTime}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
