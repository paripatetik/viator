import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";

import MobileCategorySheet from "./MobileCategorySheet";
import CategoryChip from "./CategotyChip"; // як у тебе (якщо це опечатка — виправ на "./CategoryChip")

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

  const isActive = (id) =>
    id === "all" ? selected.size === 0 : selected.has(id);

  // список вибраних категорій для мобайла
  const selectedCats = useMemo(() => {
    if (!selected || selected.size === 0) return [];
    return categories.filter((c) => selected.has(c.id));
  }, [categories, selected]);

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

      {/* mobile trigger + selected under it */}
      <div className="sm:hidden pb-6 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1 px-3 py-2 rounded bg-[#94B4C1]/75 text-base uppercase"
          
          aria-label="Відкрити список тем"
        >
          
          <span>Теми</span>
          <BookOpen size={19} strokeWidth={2} />
        </button>

        {/* selected pills */}
        <div className="flex flex-wrap gap-2 justify-start w-[100%]">
          {selected.size === 0 ? (
            <button
              type="button"
              onClick={() => onToggle("all")}
              className=" px-3 py-1 rounded-full bg-[#f7e7d7] text-black uppercase"
              title="Зараз: усі теми"
            >
              Усі
            </button>
          ) : (
            selectedCats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggle(c.id)} // тап = зняти цю категорію
                className="px-3 py-1 rounded-full bg-[#f7e7d7] text-black uppercase text-sm"
                title="Торкнись, щоб прибрати"
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* bottom-sheet with the same chips */}
      <MobileCategorySheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex flex-wrap gap-2">{chipList}</div>
      </MobileCategorySheet>
    </>
  );
}
