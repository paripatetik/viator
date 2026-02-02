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

  console.log("SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("ANON", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12));
  e.preventDefault();
  setStatus("loading");
  setMessage("");

  const email = values.email.trim();
  const name = values.name.trim();

  const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/super-processor`;

  const resp = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // сюди sb_publishable_...
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, name, source: "viator" }),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    setMessage("Сталася помилка, спробуйте пізніше.");
    setStatus("error");
    return;
  }

  if (data?.already) {
    setMessage("Ви вже підписані на розсилку 🙂");
    setStatus("error");
    return;
  }

  setStatus("success");
  setMessage("Дякуємо! Тепер ви у нашій розсилці ✉️");
  setValues({ name: "", email: "" });
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