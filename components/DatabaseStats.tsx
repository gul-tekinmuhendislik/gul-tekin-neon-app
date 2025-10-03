import { sql } from '@/lib/db';
import Link from 'next/link';

async function getDatabaseStats() {
  try {
    // Markalar sayısı
    const markalarResult = await sql`
      SELECT COUNT(*) as count FROM markalar WHERE aktif = true
    `;

    // Hizmetler sayısı
    const hizmetlerResult = await sql`
      SELECT COUNT(*) as count FROM hizmetler WHERE aktif = true
    `;

    // Projeler sayısı
    const projelerResult = await sql`
      SELECT COUNT(*) as count FROM projeler_gul_tekin WHERE aktif = true
    `;

    // Ürünler sayısı
    const urunlerResult = await sql`
      SELECT COUNT(*) as count FROM urunler WHERE aktif = true
    `;

    return {
      markalar: Number(markalarResult[0]?.count || 0),
      hizmetler: Number(hizmetlerResult[0]?.count || 0),
      projeler: Number(projelerResult[0]?.count || 0),
      urunler: Number(urunlerResult[0]?.count || 0)
    };
  } catch (error) {
    console.error('Database stats error:', error);
    return {
      markalar: 0,
      hizmetler: 0,
      projeler: 0,
      urunler: 0
    };
  }
}

export default async function DatabaseStats() {
  const stats = await getDatabaseStats();

  const statCards = [
    {
      title: "Markalar",
      count: stats.markalar,
      icon: "🏢",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      description: "Çalıştığımız markalar",
      href: "/markalar"
    },
    {
      title: "Hizmetler",
      count: stats.hizmetler,
      icon: "🛠️",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      description: "Sunduğumuz hizmetler",
      href: "/hizmetler"
    },
    {
      title: "Projeler",
      count: stats.projeler,
      icon: "🏗️",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      description: "Tamamlanan projeler",
      href: "/projeler"
    },
    {
      title: "Ürünler",
      count: stats.urunler,
      icon: "📦",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      description: "Ürün çeşitliliği",
      href: "/urunler"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Hizmet Kapsamımız
            </h2>
            <p className="text-lg text-gray-600">
              Geniş ürün yelpazesi ve profesyonel hizmetlerimizle yanınızdayız
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                href={stat.href}
                className={`relative ${stat.bgColor} rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden cursor-pointer block`}
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </span>
                    <span className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.count}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600">
              Veritabanımızda kayıtlı <span className="font-semibold text-gray-900">{stats.markalar + stats.hizmetler + stats.projeler + stats.urunler}+</span> kayıt ile
              hizmetinizdeyiz
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}