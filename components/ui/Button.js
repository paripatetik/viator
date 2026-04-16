import { buttonStyles, cn } from "@/lib/styles";

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button className={cn(buttonStyles[variant], className)} {...props}>
      {children}
    </button>
  );
}
