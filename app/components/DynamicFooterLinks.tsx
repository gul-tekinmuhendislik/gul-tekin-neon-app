'use client';

import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

interface SiteDomain {
  id: number;
  siteadi: string;
  url: string;
  kategori: string;
  icon: string;
}

const getIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ElementType } = {
    'facebook': Icons.Facebook,
    'twitter': Icons.Twitter,
    'map-pin': Icons.MapPin,
    'message-circle': Icons.MessageCircle,
    'github': Icons.Github,
    'linkedin': Icons.Linkedin,
    'youtube': Icons.Youtube,
    'instagram': Icons.Instagram,
    'cpu': Icons.Cpu,
    'droplet': Icons.Droplet,
    'sun': Icons.Sun,
    'thermometer': Icons.Thermometer,
    'package': Icons.Package,
    'edit': Icons.Edit,
    'map': Icons.Map,
    'home': Icons.Home,
    'link': Icons.Link,
    'globe': Icons.Globe,
    'star': Icons.Star,
  };

  const IconComponent = iconMap[iconName] || Icons.Link;
  return <IconComponent className="w-5 h-5" />;
};

const getHoverColor = (siteadi: string): string => {
  const colorMap: { [key: string]: string } = {
    'Facebook': 'hover:text-blue-600',
    'Twitter': 'hover:text-sky-500',
    'Youtube': 'hover:text-red-600',
    'Whatsapp': 'hover:text-green-600',
    'Github': 'hover:text-gray-900',
    'Linkedin': 'hover:text-blue-700',
    'Instagram': 'hover:text-pink-600',
    'Google Business': 'hover:text-red-600',
    'Güneş Enerjisi': 'hover:text-yellow-600',
    'Isı Pompası': 'hover:text-orange-600',
  };

  return colorMap[siteadi] || 'hover:text-gray-900';
};

const getDefaultLinks: SiteDomain[] = [
  { id: 1, siteadi: 'Facebook', url: 'https://www.facebook.com/gultekinbodrum', kategori: 'social', icon: 'facebook' },
  { id: 2, siteadi: 'Twitter', url: 'https://x.com/gul_tekin_muh', kategori: 'social', icon: 'twitter' },
  { id: 3, siteadi: 'Instagram', url: 'https://www.instagram.com/gultekinbodrum/', kategori: 'social', icon: 'instagram' },
  { id: 4, siteadi: 'Youtube', url: 'https://www.youtube.com/@gultekinbodrum', kategori: 'social', icon: 'youtube' },
  { id: 5, siteadi: 'Github', url: 'https://github.com/gul-tekinmuhendislik', kategori: 'social', icon: 'github' },
  { id: 6, siteadi: 'Google Business', url: 'https://g.page/r/Cd6nGRPdggFxEBE/review', kategori: 'social', icon: 'star' },
];

export default function DynamicFooterLinks() {
  const [links, setLinks] = useState<SiteDomain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('/static-data/sites-domain.json');
        if (response.ok) {
          const data = await response.json();
          setLinks(data);
        } else {
          setLinks(getDefaultLinks);
        }
      } catch (error) {
        console.error('Error fetching footer links:', error);
        setLinks(getDefaultLinks);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Filter only social links for footer
  const socialLinks = links.filter(link => link.kategori === 'social');

  // Add Google Reviews link manually as it's not in the database
  const additionalLinks = [
    {
      id: 999,
      siteadi: 'Google Reviews',
      url: 'https://g.page/r/Cd6nGRPdggFxEBE/review',
      kategori: 'social',
      icon: 'star'
    }
  ];

  const allLinks = [...socialLinks, ...additionalLinks];

  return (
    <div className="flex items-center gap-4">
      {allLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-600 transition-colors ${getHoverColor(link.siteadi)}`}
          aria-label={link.siteadi}
          title={link.siteadi}
        >
          {getIcon(link.icon)}
        </a>
      ))}
    </div>
  );
}
