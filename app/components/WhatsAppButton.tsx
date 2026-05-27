"use client";

import { WhatsappLogo } from "@phosphor-icons/react";

const WHATSAPP_NUMBER = "905323177859";
const WHATSAPP_MESSAGE = "Merhaba, Gül-Tekin Mühendislik hakkında bilgi almak istiyorum.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function WhatsAppButton() {
  const handleClick = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", { event_category: "contact", event_label: "whatsapp_floating_click" });
    }
  };

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="WhatsApp ile iletişime geçin"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-300 ease-in-out text-sm font-medium pl-0 group-hover:pl-4 group-hover:pr-1">
        WhatsApp
      </span>
      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] group-hover:bg-[#20BD5A] transition-colors">
        <WhatsappLogo className="w-7 h-7" weight="fill" color="white" />
      </span>
    </a>
  );
}
