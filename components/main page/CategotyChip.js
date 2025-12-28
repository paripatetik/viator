import clsx from "clsx";
import { playfair, inter } from "@/lib/fonts";
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
       className={`${inter.className}
              px-5 py-2 rounded-full tracking-wide text-xl whitespace-nowrap
              transition-all duration-300 ease-in-out 
              ${active ? "border-4 border-[#94B4C1]" : "border border-transparent text-black"}
              bg-[#DEAA79] text-slate-900`}
>
      {name}
    </button>
  );
}