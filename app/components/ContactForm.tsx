"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

// Formspree endpoint — replace with your own Formspree form action URL
const FORMSPREE_ACTION = "https://formspree.io/f/YOUR_FORM_ID";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const formData = new FormData(e.currentTarget);
    const data: FormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch(FORMSPREE_ACTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.",
        });
        (e.currentTarget as HTMLFormElement).reset();
      } else {
        setSubmitStatus({
          type: "error",
          message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClassName = "mt-2 min-h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15";
  const labelClassName = "block text-sm font-medium text-gray-800";

  return (
    <form onSubmit={onSubmit} className="space-y-5" action={FORMSPREE_ACTION} method="POST" encType="application/json">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClassName}>Ad Soyad</label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            required
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>E-posta</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            pattern="^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClassName}>Konu</label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClassName}>Mesaj</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`${fieldClassName} min-h-36 resize-y`}
        />
      </div>

      {submitStatus.type && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg p-4 text-sm ${
            submitStatus.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#08765c] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#075d49] focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Gönderiliyor..." : "Mesaj gönder"}
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
