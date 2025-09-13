'use client';

import { useEffect, useRef } from 'react';

interface GoogleMapProps {
  className?: string;
  height?: string;
}

export default function GoogleMap({ className = '', height = '400px' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      // Gül-Tekin Mühendislik konumu (Yalıkavak, Bodrum)
      const position = { lat: 37.1073, lng: 27.3089 };

      // Harita oluştur
      map.current = new google.maps.Map(mapRef.current, {
        center: position,
        zoom: 15,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }]
          },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
          }
        ]
      });

      // İşaretçi ekle
      marker.current = new google.maps.Marker({
        position,
        map: map.current,
        title: 'Gül-Tekin Mühendislik',
        animation: google.maps.Animation.DROP,
      });

      // Info window ekle
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; color: #333;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">Gül-Tekin Mühendislik</h3>
            <p style="margin: 0; font-size: 14px;">Yalıkavak, Bodrum, Muğla</p>
            <a href="https://maps.google.com/?q=37.1073,27.3089" target="_blank" rel="noopener noreferrer"
               style="color: #1a73e8; text-decoration: none; font-size: 14px;">
              Haritada Görüntüle →
            </a>
          </div>
        `
      });

      marker.current.addListener('click', () => {
        infoWindow.open(map.current, marker.current);
      });
    };

    // Google Maps script yükle
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (marker.current) {
        marker.current.setMap(null);
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-xl overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}