import { FaInstagram, FaYoutube, FaTelegram } from "react-icons/fa";

export default function SocialLinks({ variant = "footer" }) {
  const base = "transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 rounded-sm";
  const styles = {
    header: "hidden md:flex gap-3 lg:gap-4 items-center",
    drawer: "flex gap-8 justify-center",
    footer: "flex gap-5 justify-between mt-5",
  };

  // Нейтральна база + м'які hover-кольори (менше “кислоти” у хедері)
  const iconBase =
    "opacity-80 hover:opacity-100 text-slate-800";

  const headerSize = "text-[22px] lg:text-[26px]";
  const otherSize = "text-[32px]";

  const size = variant === "header" ? headerSize : otherSize;

  return (
    <div className={styles[variant]}>
      <a href="https://t.me/yourchannel" aria-label="Telegram" className={base}>
        <FaTelegram className={`${size} ${iconBase} hover:text-[#229ED9]`} />
      </a>
      <a href="https://instagram.com" aria-label="Instagram" className={base}>
        <FaInstagram className={`${size} ${iconBase} hover:text-[#E1306C]`} />
      </a>
      <a href="https://youtube.com" aria-label="YouTube" className={base}>
        <FaYoutube className={`${size} ${iconBase} hover:text-[#FF0000]`} />
      </a>
    </div>
  );
}