import { inter } from "@/lib/fonts";
import { cn } from "@/lib/styles";
/**
 * A single selectable category pill.
 *
 * Props
 * - id        : number | "all"      unique identifier passed back on click
 * - name      : string              label inside the chip
 * - active    : boolean             whether it’s currently selected
 * - onToggle  : (id) => void        click handler supplied by parent
 */
export default function CategoryChip({ id, name, active, onToggle }) {
  return (
    <button
      onClick={() => onToggle(id)}
      className={cn(
        inter.className,
        "relative z-[30] inline-flex items-center px-4 py-2 rounded-full tracking-wide text-base whitespace-nowrap uppercase border transition-transform transition-shadow duration-300 ease-in-out bg-[#E7ECEE]/92 text-[#1E2A32] shadow-sm",
        active
          ? "border-white bg-white"
          : "border-white/55 hover:-translate-y-2 hover:bg-white hover:shadow-md"
      )}
    >
      {name}
    </button>
  );
}
