'use client';

import { Mail, MessageCircle, Phone } from 'lucide-react';
import { CONTACT_INFO, phoneHref, whatsappHref } from '@/lib/contact-info';

export default function GoogleMyBusiness() {
  return (
    <section aria-labelledby="direct-contact-title" className="h-full rounded-lg bg-[#123c35] p-5 text-white sm:p-7">
      <p className="mb-2 text-sm font-semibold uppercase text-emerald-200">Hızlı iletişim</p>
      <h2 id="direct-contact-title" className="text-2xl font-semibold">Bize doğrudan ulaşın</h2>
      <p className="mt-2 text-sm leading-6 text-emerald-50/80">
        Size uygun kanaldan ekibimize ulaşabilirsiniz.
      </p>

      <div className="mt-6 divide-y divide-white/15">
        <a
          href={phoneHref(CONTACT_INFO.landline.tel)}
          className="group flex min-h-[76px] items-center gap-4 py-3 transition-colors hover:text-emerald-200"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Phone className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-emerald-100/75">Ofis telefonu</span>
            <span className="block whitespace-nowrap text-lg font-semibold tabular-nums sm:text-xl">
              {CONTACT_INFO.landline.displayFormatted}
            </span>
          </span>
        </a>

        <a
          href={phoneHref(CONTACT_INFO.mobile.tel)}
          className="group flex min-h-[76px] items-center gap-4 py-3 transition-colors hover:text-emerald-200"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Phone className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-emerald-100/75">Cep telefonu</span>
            <span className="block whitespace-nowrap text-lg font-semibold tabular-nums sm:text-xl">
              {CONTACT_INFO.mobile.displayFormatted}
            </span>
          </span>
        </a>

        <a
          href={whatsappHref(CONTACT_INFO.whatsapp.tel)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-[76px] items-center gap-4 py-3 transition-colors hover:text-emerald-200"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-emerald-100/75">WhatsApp</span>
            <span className="block whitespace-nowrap text-lg font-semibold tabular-nums sm:text-xl">
              {CONTACT_INFO.whatsapp.displayFormatted}
            </span>
          </span>
        </a>

        <a
          href={`mailto:${CONTACT_INFO.email}`}
          className="flex min-h-[68px] items-center gap-4 py-3 transition-colors hover:text-emerald-200"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Mail className="h-5 w-5" />
          </span>
          <span className="min-w-0 break-all text-sm font-medium sm:text-base">{CONTACT_INFO.email}</span>
        </a>
      </div>
    </section>
  );
}