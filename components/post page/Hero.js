import Image from "next/image";
import { Clock } from "lucide-react";
import { heroHeightStyle, heroStyles } from "@/lib/styles";
import { playfair } from "@/lib/fonts";

export function Hero({
  title,
  author,
  date,
  category,
  readingTime,
  img,
}) {
  const meta = [
    author,
    date,
    category,
    readingTime,
  ].filter(Boolean);

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
        unoptimized
        sizes="100vw"
        className="object-cover object-center md:object-[50%_20%]"
      />
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/68 via-black/42 to-transparent md:h-[64%]" />

      <div className="relative flex h-full flex-col justify-end">
        <div className="container relative mx-auto px-6 pb-3 text-white md:pb-5">
          <h1
            className={`${playfair.className} max-w-5xl text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-[4.5rem]`}
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div className="mt-4 h-px w-24 bg-viator-sky/85" />

          {meta.length > 0 && (
            <p className="mt-4 flex max-w-4xl flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium uppercase tracking-[0.16em] text-white/80 md:text-[15px]">
              {meta.map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-1.5">
                  {item === readingTime && <Clock size={15} strokeWidth={1.8} />}
                  <span>{item}</span>
                  {index < meta.length - 1 && (
                    <span className="ml-1 text-white/40">/</span>
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
