import { AnimatePresence, motion } from "framer-motion";

/**
 * Bottom-sheet for category chips (mobile).
 * • Slides **UP** from bottom
 * • Slides **DOWN** on close
 * • Backdrop blocks clicks but does NOT close the sheet
 */
export default function MobileCategorySheet({
  open,
  onClose,
  children,
  height = "80vh",        // how tall the sheet should be
}) {
  /* ── animation variants ─────────────────────────────── */
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0 },
  };
  const panel = {
    hidden:  { y: "100%" },   // start completely off-screen, bottom
    visible: { y: 0 },
    exit:    { y: "100%" },   // slide back down
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* dark backdrop (does NOT close on click) */}
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-[60]"
          />

          {/* sliding bottom sheet */}
          <motion.div
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-2xl
                       shadow-xl p-6 pt-4 overflow-y-auto"
            style={{ height }}
          >
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">Всі теми</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-6xl leading-none p-3 -m-3 text-red-900 weight-bold"
              >
                &times;
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}