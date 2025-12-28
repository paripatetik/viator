import { useState } from "react";
import MobileCategorySheet from "./MobileCategorySheet";
import CategoryChip from "./CategotyChip";     // ← import the new chip

/**
 * Presentational picker for category chips.
 *
 * props:
 *  - categories : [{ id, name }]
 *  - selected   : Set    (empty = “all”)
 *  - onToggle   : fn(id | "all")
 */
export default function CategoryPicker({ categories = [], selected, onToggle }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  // helper to decide if a chip is active
  const isActive = (id) =>
    id === "all" ? selected.size === 0 : selected.has(id);

  // ----- desktop & mobile chip list ----------------------------
  const chipList = (
    <>
      <CategoryChip
        id="all"
        name="Усі"
        active={isActive("all")}
        onToggle={onToggle}
      />
      {categories.map((c) => (
        <CategoryChip
          key={c.id}
          id={c.id}
          name={c.name}
          active={isActive(c.id)}
          onToggle={onToggle}
        />
      ))}
    </>
  );

  return (
    <>
      {/* desktop chips */}
      <div className="hidden sm:flex gap-3 overflow-x-auto pb-6 mb-4 flex-wrap">
        {chipList}
      </div>

      {/* mobile trigger */}
      <div className="sm:hidden pb-6 flex justify-end">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-white text-xl tracking-wider uppercase"
          style={{ backgroundColor: "#DEAA79" }}
        >
          Обрати тему <span>▼</span>
        </button>
      </div>

      {/* bottom-sheet with the same chips */}
      <MobileCategorySheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex flex-wrap gap-2">{chipList}</div>
      </MobileCategorySheet>
    </>
  );
}