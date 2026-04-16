import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";

import MobileCategorySheet from "./MobileCategorySheet";
import CategoryChip from "./CategotyChip";
import Button from "@/components/ui/Button";
import { buttonStyles } from "@/lib/styles";

export default function CategoryPicker({ categories = [], selected, onToggle }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (id) =>
    id === "all" ? selected.size === 0 : selected.has(id);

  const selectedCats = useMemo(() => {
    if (!selected || selected.size === 0) return [];
    return categories.filter((c) => selected.has(c.id));
  }, [categories, selected]);

  const chipList = (
    <>
      <CategoryChip id="all" name="Усі" active={isActive("all")} onToggle={onToggle} />
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
      {/* DESKTOP — варіант A: WRAP без скролу (не ріже translate/shadow) */}
      <div className="hidden sm:flex flex-wrap gap-3 mb-4 pb-6 pt-2 -mt-2 overflow-visible">
        {chipList}
      </div>

      {/*
      // DESKTOP — варіант B: СКРОЛ без wrap (якщо реально треба overflow-x-auto)
      <div className="hidden sm:block mb-4 overflow-visible">
        <div className="overflow-x-auto py-3 -my-3">
          <div className="flex gap-3 w-max">
            {chipList}
          </div>
        </div>
        <div className="pb-6" />
      </div>
      */}

      {/* MOBILE trigger + selected under it */}
      <div className="sm:hidden pb-6 flex flex-col items-end gap-3">
        <Button
          variant="categoryTrigger"
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Відкрити список тем"
        >
          <span>Теми</span>
          <BookOpen size={19} strokeWidth={2} />
        </Button>

        <div className="flex flex-wrap gap-2 justify-start w-full">
          {selected.size === 0 ? (
            <button
              type="button"
              onClick={() => onToggle("all")}
              className={buttonStyles.categoryPill}
              title="Зараз: усі теми"
            >
              Усі
            </button>
          ) : (
            selectedCats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggle(c.id)}
                className={`${buttonStyles.categoryPill} text-sm`}
                title="Торкнись, щоб прибрати"
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      </div>

      <MobileCategorySheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex flex-wrap gap-2">{chipList}</div>
      </MobileCategorySheet>
    </>
  );
}
