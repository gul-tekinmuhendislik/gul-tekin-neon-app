'use client';

import { useEffect, useState } from 'react';

interface Statistic {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: string;
}

const statistics: Statistic[] = [
  {
    label: 'Tamamlanan Proje',
    value: 500,
    suffix: '+',
    icon: '🏗️'
  },
  {
    label: 'Müşteri Memnuniyeti',
    value: 98,
    suffix: '%',
    icon: '😊'
  },
  {
    label: 'Yıllık Deneyim',
    value: 24,
    suffix: '+',
    icon: '📅'
  },
  {
    label: 'Uzman Ekip',
    value: 25,
    suffix: ' Kişi',
    icon: '👷'
  },
  {
    label: 'Enerji Tasarrufu',
    value: 45,
    suffix: '%',
    prefix: '~',
    icon: '⚡'
  },
  {
    label: 'Hizmet Verilen İlçe',
    value: 12,
    suffix: '+',
    icon: '📍'
  }
];

interface CounterProps {
  stat: Statistic;
}

function Counter({ stat }: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`stat-${stat.label}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [stat.label]);

  useEffect(() => {
    if (isVisible && count < stat.value) {
      const timer = setTimeout(() => {
        const increment = Math.ceil(stat.value / 50);
        setCount((prevCount) => {
          const nextCount = prevCount + increment;
          return nextCount > stat.value ? stat.value : nextCount;
        });
      }, 30);

      return () => clearTimeout(timer);
    }
  }, [count, stat.value, isVisible]);

  return (
    <div
      id={`stat-${stat.label}`}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="text-4xl mb-3">{stat.icon}</div>
      <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
        {stat.prefix}
        {count}
        {stat.suffix}
      </div>
      <div className="text-gray-600 font-medium">{stat.label}</div>
    </div>
  );
}

export default function ProjectStatistics() {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Proje İstatistiklerimiz
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            2000 yılından bu yana Muğla bölgesinde güvenilir mühendislik hizmetleri sunuyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {statistics.map((stat) => (
            <Counter key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full">
            <span className="text-lg font-semibold">
              Bodrum ve Çevresinde Lider Mühendislik Firması
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}