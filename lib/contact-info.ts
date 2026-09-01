export const CONTACT_INFO = {
  landline: {
    display: "02523863554",
    displayFormatted: "0252 386 35 54",
    displayIntl: "+90 (252) 386 35 54",
    tel: "+902523863554",
  },
  mobile: {
    displayFormatted: "0532 317 78 59",
    tel: "+905323177859",
  },
  whatsapp: {
    displayFormatted: "0541 457 30 19",
    tel: "+905414573019",
  },
  email: "info@gul-tekinmuhendislik.com",
} as const;

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function whatsappHref(phone: string, text?: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  const formattedPhone = digits.startsWith("90")
    ? digits
    : digits.startsWith("0")
    ? `90${digits.slice(1)}`
    : `90${digits}`;
  const textParam = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${formattedPhone}${textParam}`;
}
