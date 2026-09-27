"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.",
        });
        reset();
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Bir hata oluştu. Lütfen tekrar deneyin.",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClassName}>Ad Soyad</label>
          <input
            type="text"
            id="name"
            autoComplete="name"
            {...register("name", { required: "Ad soyad gereklidir" })}
            className={fieldClassName}
          />
          {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>E-posta</label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            {...register("email", {
              required: "E-posta gereklidir",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Geçerli bir e-posta adresi giriniz",
              },
            })}
            className={fieldClassName}
          />
          {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClassName}>Konu</label>
        <input
          type="text"
          id="subject"
          {...register("subject", { required: "Konu gereklidir" })}
          className={fieldClassName}
        />
        {errors.subject && <p className="mt-1 text-sm text-red-700">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className={labelClassName}>Mesaj</label>
        <textarea
          id="message"
          rows={5}
          {...register("message", { required: "Mesaj gereklidir" })}
          className={`${fieldClassName} min-h-36 resize-y`}
        />
        {errors.message && <p className="mt-1 text-sm text-red-700">{errors.message.message}</p>}
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