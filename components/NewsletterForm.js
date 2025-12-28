"use client";                          // if you’re on Next 13/14 App Router
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewsletterForm({ className = "" }) {
  const [values, setValues] = useState({ name: "", email: "" });
  const [status, setStatus] = useState("idle");         // idle | loading | success | error
  const [message, setMessage] = useState("");

  const onChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase
      .from("subscribers")
      .insert([{ name: values.name.trim(), email: values.email.trim() }]);

    if (error) {
      // duplicate e-mail throws code 23505 (unique violation)
      setMessage(
        error.code === "23505"
          ? "Ви вже підписані на розсилку 🙂"
          : "Сталася помилка, спробуйте пізніше."
      );
      setStatus("error");
    } else {
      setStatus("success");
      setMessage("Дякуємо! Перевірте пошту для підтвердження ✉️");
      setValues({ name: "", email: "" });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 max-w-md ${className}`}
      aria-label="Форма підписки на розсилку"
    >
      <input
        name="name"
        type="text"
        value={values.name}
        onChange={onChange}
        placeholder="Ім'я"
        required
        className="w-full bg-transparent border-b border-black py-3 placeholder-gray-400 focus:outline-none"
      />

      <input
        name="email"
        type="email"
        value={values.email}
        onChange={onChange}
        placeholder="Email"
        required
        className="w-full bg-transparent border-b border-black py-3 placeholder-gray-400 focus:outline-none"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[#FFAB5B] border-2 border-black text-black uppercase font-bold tracking-wide px-10 py-3 rounded-full hover:bg-slate-100 active:scale-95 transition disabled:opacity-60"
      >
        {status === "loading" ? "Надсилаємо..." : "Підписатися"}
      </button>

      {message && (
        <p
          className={
            status === "success" ? "text-green-800 text-sm" : "text-red-700 text-sm"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}