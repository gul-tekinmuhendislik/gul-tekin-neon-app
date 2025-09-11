import Image from "next/image";

export function LogoCloud() {
  const partners = [
    {
      name: "Aldea",
      logo: "/aldea.jpeg",
    },
    {
      name: "REHAU",
      logo: "/REHAU.png",
    },
    {
      name: "Solimpeks",
      logo: "/solimpeks.png",
    },
    {
      name: "Varmek",
      logo: "/varmek.png",
    },
    {
      name: "Wepomp",
      logo: "/wepomp.png",
    },
    {
      name: "Wilo",
      logo: "/wilo.png",
    },
    {
      name: "Yelkenci",
      logo: "/yelkenci.png",
    },
  ];

  return (
    <section
      id="partners"
      className="mx-auto max-w-7xl px-6 text-center md:px-8 py-16"
    >
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <h2 className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Çözüm Ortaklarımız
        </h2>
        <p className="mt-2 text-center text-base text-gray-500">
          Sektörün lider markalarıyla güvenilir çözümler sunuyoruz
        </p>
        <div className="mt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16">
            {partners.map((partner) => (
              <li key={partner.name}>
                <div className="flex items-center justify-center h-12 w-32 relative grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                  <Image
                    alt={`${partner.name} - Gül-Tekin Mühendislik çözüm ortağı`}
                    src={partner.logo}
                    className="h-full w-full object-contain"
                    width={128}
                    height={48}
                    priority
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}