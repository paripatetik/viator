import Image from "next/image";
import Link from "next/link";
import { garamond } from "@/lib/fonts";
import { cn, imageLinkStyles } from "@/lib/styles";

export default function ImageActionLink({
  href,
  imgSrc,
  alt,
  label,
  className = "",
}) {
  return (
    <Link
      href={href}
      className={cn(imageLinkStyles.root, className)}
      target="_blank"
      rel="noreferrer"
    >
      <div className={imageLinkStyles.frame}>
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={imageLinkStyles.image}
        />
      </div>
      {label && (
        <span className={cn(garamond.className, imageLinkStyles.label)}>
          {label}
        </span>
      )}
    </Link>
  );
}
