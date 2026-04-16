import { garamond, playfair } from "@/lib/fonts";
import { cn, typeStyles } from "@/lib/styles";

const fonts = {
  garamond: garamond.className,
  playfair: playfair.className,
  none: "",
};

const variants = {
  section: typeStyles.sectionHeading,
  related: typeStyles.relatedHeading,
};

export default function SectionHeading({
  as: Tag = "h2",
  font = "playfair",
  variant = "section",
  className = "",
  children,
}) {
  return (
    <Tag className={cn(fonts[font], variants[variant], className)}>
      {children}
    </Tag>
  );
}
