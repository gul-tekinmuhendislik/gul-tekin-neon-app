'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  className?: string;
  height?: string;
}

export default function GoogleMap({ className = '', height = '400px' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const mapReady = useRef(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [loadError, setLoadError] = useState(!apiKey);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(true);
      return;
    }

    // Gül-Tekin Mühendislik konumu (Yalıkavak, Bodrum)
    const position = { lat: 37.1073, lng: 27.3089 };
    let fallbackTimeout: number | undefined;
    let tilesLoadedListener: google.maps.MapsEventListener | null = null;

    const showFallback = () => {
      if (fallbackTimeout !== undefined) window.clearTimeout(fallbackTimeout);
      tilesLoadedListener?.remove();
      markerInstance.current?.setMap(null);
      markerInstance.current = null;
      mapInstance.current = null;
      setLoadError(true);
    };

    fallbackTimeout = window.setTimeout(() => {
      if (!mapReady.current) showFallback();
    }, 12000);

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      try {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          styles: [
            { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
          ],
        });

        tilesLoadedListener = mapInstance.current.addListener('tilesloaded', () => {
          mapReady.current = true;
          if (fallbackTimeout !== undefined) window.clearTimeout(fallbackTimeout);
        });

        markerInstance.current = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: 'Gül-Tekin Mühendislik',
          animation: window.google.maps.Animation.DROP,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; color: #111; font-family: sans-serif;">
              <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: bold; color: #000;">Gül-Tekin Mühendislik</h3>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #555;">Gökçebel Mah. İnönü Cad. 61/D Yalıkavak / Muğla</p>
              <a href="https://maps.google.com/?q=37.1073,27.3089" target="_blank" rel="noopener noreferrer"
                 style="color: #00875A; font-weight: 600; text-decoration: none; font-size: 13px;">
                Haritada Aç & Yol Tarifi Al →
              </a>
            </div>
          `,
        });

        markerInstance.current.addListener('click', () => {
          if (mapInstance.current && markerInstance.current) {
            infoWindow.open(mapInstance.current, markerInstance.current);
          }
        });
      } catch (err) {
        console.error('Google Map initialization error:', err);
        showFallback();
      }
    };

    // Eğer Google Maps zaten yüklüyse doğrudan çalıştır
    if (window.google?.maps) {
      initMap();
    } else {
      // Script tag'inin zaten head içinde olup olmadığını kontrol et (Çift yüklemeyi engeller)
      const scriptId = 'google-maps-sdk';
      let existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!existingScript) {
        existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement | null;
      }

      if (existingScript) {
        existingScript.addEventListener('load', initMap, { once: true });
        existingScript.addEventListener('error', showFallback, { once: true });
      } else {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        script.onerror = showFallback;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (fallbackTimeout !== undefined) window.clearTimeout(fallbackTimeout);
      tilesLoadedListener?.remove();
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
      }
      mapReady.current = false;
    };
  }, [apiKey]);

  // Google Maps API Key yoksa veya hata oluşursa güvenilir Google Maps iframe fallback'i
  if (loadError) {
    return (
      <div className={`w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md ${className}`} style={{ height }}>
        <iframe
          title="Gül-Tekin Mühendislik Konum"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://maps.google.com/maps?q=37.1073,27.3089&hl=tr&z=15&output=embed"
        />
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 ${className}`}
      style={{ height }}
    />
  );
}