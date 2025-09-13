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
      className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
        <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
          {stat.prefix}
          {count}
          {stat.suffix}
        </div>
        <div className="text-gray-700 font-semibold text-lg">{stat.label}</div>
      </div>
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl group-hover:w-32 group-hover:h-32 transition-all duration-500"></div>
    </div>
  );
}

export default function ProjectStatistics() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative container mx-auto px-4 z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Proje İstatistiklerimiz
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            2000 yılından bu yana Muğla bölgesinde güvenilir mühendislik hizmetleri sunuyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {statistics.map((stat) => (
            <Counter key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
            <span className="text-xl font-bold tracking-wide">
              Bodrum ve Çevresinde Lider Mühendislik Firması
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}