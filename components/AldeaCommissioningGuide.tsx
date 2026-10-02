import Link from 'next/link';

const checklistSections = [
  {
    title: '1. Mekanik ve montaj',
    items: [
      'Cihazın sağlam, terazide ve titreşim yalıtımlı kaideye oturduğunu kontrol edin.',
      'Hava girişi ve çıkışını kapatmayın; servis ve hava akışı için üretici boşluklarını bırakın.',
      'Yoğuşma drenajını donma riski oluşturmayacak şekilde düzenleyin.',
      'Boru bağlantılarında kaçak, gerilme ve hava cebi olmadığını; boruların uygun yalıtıldığını doğrulayın.',
      'Titreşimin tesisata aktarılmasını önlemek için uygun esnek bağlantılar kullanın.',
    ],
  },
  {
    title: '2. Hidrolik devre ve su kalitesi',
    items: [
      'Tesisatı üreticinin önerdiği yöntemle yıkayın; pislik tutucu ve manyetik filtrenin yönünü ve temizliğini kontrol edin.',
      'Otomatik purjörlerin, manuel hava alma noktalarının, genleşme tankının ve sistem basıncının uygun olduğunu doğrulayın.',
      'Kollektör devrelerini tasarım debilerine göre dengeleyin; zon vanaları kapandığında da gerekli minimum debinin korunmasını test edin.',
      'Buffer tank veya hidrolik ayırıcı varsa bağlantı yönlerini ve sensör konumlarını kontrol edin.',
      'Eski tesisatlardaki tortuyu temizleyin; devreleri ayrı ayrı doldurup havasını alın ve ilk sirkülasyondan sonra filtreleri yeniden kontrol edin.',
      'Su şartlandırma ve donma korumasını model kılavuzundaki gerekliliklere göre uygulayın.',
    ],
  },
  {
    title: '3. Elektrik, sensör ve kontrol',
    items: [
      'Besleme gerilimini, faz düzenini, kablo kesitini, sigortayı, kaçak akım korumasını ve topraklama sürekliliğini uzman personele ölçtürün.',
      'Pano bağlantılarının sıkılığını, cihaz korumalarını ve sensör/haberleşme kablolarının güzergâhını kontrol edin.',
      'Gidiş-dönüş suyu, dış hava, boyler ve debi sensörlerinin doğru konumda ve makul değer okuduğunu doğrulayın.',
      'Dış hava sensörünü doğrudan güneşten, egzoz havasından ve diğer ısı kaynaklarından koruyun.',
      'Dış hava kompanzasyonu, zon vanaları, oda termostatları, zaman programı ve varsa uzaktan kontrolü test edin.',
    ],
  },
  {
    title: '4. İlk çalıştırma sırası',
    items: [
      'Sistem basıncını ve hava alma durumunu kontrol edin.',
      'Sirkülasyon pompasını çalıştırın; tüm devrelerde su akışını doğrulayın.',
      'Cihazı düşük yükte devreye alın ve gidiş-dönüş sıcaklıklarını izleyin.',
      'Kompresör ve fanın normal çalıştığını gözleyin; sistemi tasarım koşullarına kademeli yaklaştırın.',
      'Isıtma, soğutma ve kullanım sıcak suyu modlarını ayrı ayrı test edin.',
    ],
  },
  {
    title: '5. Debi, sıcaklık farkı ve kayıt',
    items: [
      'Gidiş ve dönüş suyu sıcaklıklarını ölçün; ΔT = gidiş sıcaklığı − dönüş sıcaklığı olarak kaydedin.',
      'Toplam su debisini, sistem basıncını ve dış hava sıcaklığını ölçüp kaydedin.',
      'Mümkünse kompresör frekansı/kapasitesi, elektrik akımı ve anlık güç tüketimini de kaydedin.',
      'Düşük ΔT fazla debi veya hidrolik kısa devreye; yüksek ΔT düşük debi, kapalı devre veya filtre tıkanıklığına işaret edebilir. Tek başına ΔT ile ayar yapmayın; tasarım ve model kılavuzuyla birlikte değerlendirin.',
    ],
  },
  {
    title: '6. Isıtma, soğutma ve sıcak su testleri',
    items: [
      'Isıtmaya düşük gidiş suyu sıcaklığıyla başlayın; en uzak devrelerin debisini ve zonların ısınmasını kontrol edin.',
      'Elektrikli destek ısıtıcısının gereksiz yere devreye girmediğini doğrulayın.',
      'Soğutmada boru yalıtımını, drenajı ve yoğuşma/çiğ noktası korumasını kontrol edin.',
      'Boyler sensörünü, üç yollu vanayı veya şarj pompasını ve sıcak su önceliğinin mahal ısıtmasına etkisini test edin.',
      'Haşlanma riskine karşı uygun karışım vanasını değerlendirin; hijyen çevrimlerini üretici talimatına göre ayarlayın.',
    ],
  },
  {
    title: '7. Güvenlik, ses ve kullanıcı teslimi',
    items: [
      'Debi, donma, yüksek/düşük basınç, aşırı sıcaklık, pompa, sensör ve elektrik korumalarının devrede olduğunu doğrulayın.',
      'Güvenlik elemanlarını köprülemeyin veya devre dışı bırakmayın.',
      'Anormal titreşim, metalik ses, fan sürtmesi, sık dur-kalk, kararsız sıcaklık ve anormal basınç değişimini araştırın.',
      'Model/seri numarası, ölçümler, filtre durumu, kontrol ayarları, hata kayıtları ve bakım planını teslim formuna yazın.',
      'Kullanıcıya basınç takibini, filtre bakımını, mod kullanımını ve hata halinde servis çağırma adımlarını anlatın.',
    ],
  },
];

const faultCategories = [
  ['Debi/akış uyarısı', 'Hava, kapalı vana, kirli filtre, pompa ayarı veya düşük basınç olabilir. Vanaları ve filtreyi kontrol edin; debiyi ölçün.'],
  ['Su sıcaklık sensörü', 'Soket, kablo, sensör konumu veya sensör arızası olabilir. Elektrik bağlantısı servis tarafından incelenmeli.'],
  ['Dış hava sensörü', 'Kablo/soket sorunu veya uygun olmayan sensör konumu olabilir. Bağlantı ve konum kontrol edilmeli.'],
  ['Yüksek basınç koruması', 'Yetersiz debi, kapalı vana, yüksek su sıcaklığı veya eşanjör kirliliği olası nedenlerdir. Cihazı zorlamayın; debi ve filtreyi kontrol ettirin.'],
  ['Düşük basınç/soğutucu devre', 'Kaçak veya soğutucu devre sorunu olabilir. Gaz devresine müdahale etmeyin; yetkili soğutma servisine başvurun.'],
  ['Donma koruması', 'Düşük debi, yetersiz yalıtım, enerji kesintisi veya düşük dış hava koşulları araştırılmalı.'],
  ['Kompresör/inverter, fan veya haberleşme', 'Besleme, fiziksel engel, kablo veya kart arızası ihtimali vardır. Elektrik ve kart kontrollerini uzman servise bırakın.'],
];

export default function AldeaCommissioningGuide() {
  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="aldea-guide-title">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold text-amber-800">ALD-DAMB10 / DAMB13 / DAMB16</p>
        <h2 id="aldea-guide-title" className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Aldea Blue Isı Pompası Devreye Alma ve İlk Çalıştırma Rehberi
        </h2>
        <p className="mt-4 leading-7 text-slate-700">
          Devreye almada güvenli çalışma, yeterli su debisi, kararlı sıcaklık farkı ve düşük gidiş suyu sıcaklığında verim hedeflenir. Bu kontrol listesi uzman servis içindir; kesin sınırlar cihazın tam model ve seri revizyonuna ait resmi montaj/servis kılavuzundan alınmalıdır.
        </p>
        <div className="mt-5 rounded border-l-4 border-amber-600 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Önemli:</strong> Minimum debi, çalışma basıncı, elektrik değerleri, su hacmi ve sıcaklık limitleri modele göre değişebilir. Aşağıdaki debiler broşürde belirtilen nominal değerlerdir; proje ayarı yerine kullanılamaz.
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <caption className="mb-3 text-left font-semibold text-slate-900">Broşürde verilen nominal su debileri</caption>
          <thead>
            <tr className="border-b border-slate-300 text-slate-600">
              <th scope="col" className="py-2 pr-4">Model</th>
              <th scope="col" className="py-2">Nominal debi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200"><th scope="row" className="py-2 pr-4 font-medium">ALD-DAMB10</th><td className="py-2">Yaklaşık 1,8 m³/h</td></tr>
            <tr className="border-b border-slate-200"><th scope="row" className="py-2 pr-4 font-medium">ALD-DAMB13</th><td className="py-2">Yaklaşık 2,7 m³/h</td></tr>
            <tr className="border-b border-slate-200"><th scope="row" className="py-2 pr-4 font-medium">ALD-DAMB16</th><td className="py-2">Yaklaşık 3,7 m³/h</td></tr>
          </tbody>
        </table>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Su tarafı basınç kaybını ve gerçek çalışma debisini ilgili model broşürü/kılavuzu, sistem tasarımı, pompa eğrisi ve tesisat kayıplarıyla birlikte değerlendirin.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {checklistSections.map((section) => (
          <details key={section.title} className="group rounded border border-slate-200 bg-white px-4 py-3 open:border-amber-300">
            <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {section.title}
                <span aria-hidden="true" className="text-xl text-amber-800 group-open:rotate-45">+</span>
              </span>
            </summary>
            <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-700">
              {section.items.map((item) => <li key={item} className="ml-5 list-disc pl-1">{item}</li>)}
            </ul>
          </details>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold text-slate-900">İlk çalıştırmada hata görülürse</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Aldea Blue için herkese açık belgelerde tüm model ve kart revizyonlarını kapsayan hata kodu-çözüm tablosu bulunmayabilir. E1, E2, P1 veya H1 gibi kodlara marka/model kılavuzuyla doğrulamadan anlam atamayın.
          </p>
          <dl className="mt-4 divide-y divide-slate-200">
            {faultCategories.map(([term, description]) => (
              <div key={term} className="py-3">
                <dt className="font-semibold text-slate-900">{term}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-700">{description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900">Güvenli ilk kontrol sırası</h3>
          <ol className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            <li>1. Ekrandaki tam hata kodunun fotoğrafını çekin; cihazın model ve seri numarasını kaydedin.</li>
            <li>2. Hatanın hangi modda ve hangi koşulda oluştuğunu not edin.</li>
            <li>3. Sistem basıncını, açık vanaları, filtreyi, hava durumunu ve pompa çalışmasını uzmanla kontrol edin.</li>
            <li>4. Hata silinmiyorsa veya tekrarlıyorsa art arda resetlemeyin; yetkili/uzman servise başvurun.</li>
          </ol>
          <div className="mt-5 rounded border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
            <strong>Cihazı durdurup servis çağırın:</strong> tekrarlayan basınç hatası, metalik kompresör sesi, yanık kokusu, su kaçağı, elektrik panosunda kıvılcım/aşırı ısınma, fanın çalışmaması, yoğun buzlanma veya reset sonrası geri gelen hata durumlarında.
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Güvenlik şalterlerini köprülemeyin; soğutucu devreyi açmayın veya gaz eklemeyin; fazları deneme amacıyla değiştirmeyin; emniyet ventilini kapatmayın ve donmuş boruya sıcak su uygulamayın.
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <h3 className="text-lg font-bold text-slate-900">Aldea ürün ve hizmet sayfaları</h3>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
          <Link className="text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-950" href="/urunler?marka=ALDEA&kategori=Is%C4%B1%20Pompalar%C4%B1">Aldea ısı pompası modellerini inceleyin</Link>
          <Link className="text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-950" href="/lokasyonlar/bodrum/hizmet/isi-pompalari">Bodrum ısı pompası kurulum ve servis hizmeti</Link>
          <Link className="text-amber-800 underline decoration-amber-300 underline-offset-4 hover:text-amber-950" href="/contact">Devreye alma ve teknik destek için iletişim</Link>
        </div>
      </div>
    </section>
  );
}