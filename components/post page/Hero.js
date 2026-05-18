import Image from "next/image";
import { Clock } from "lucide-react";
import { heroHeightStyle, heroStyles } from "@/lib/styles";

export function Hero({
  title,
  author,
  date,
  readingTime,
  img,
}) {
  return (
    <section
      className={heroStyles.root}
      style={{
        ...heroHeightStyle,
        backgroundImage: img ? `url("${img}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Image
        src={img}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:object-[50%_20%]"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative flex h-full flex-col justify-end">
        <div className="container relative mx-auto px-6 pb-8 md:pb-10 text-white">
          <h1
            className="font-extrabold leading-tight text-3xl sm:text-5xl md:text-6xl"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div className="mt-2 h-1 w-20 bg-viator-sky" />

          <p
            className="
              mt-2 flex items-center gap-2 justify-start
              text-white/80 whitespace-nowrap
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
