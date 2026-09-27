import { CONTACT_INFO } from '@/lib/contact-info';

interface GoogleMapProps {
  className?: string;
  height?: string;
}

export default function GoogleMap({ className = '', height = '400px' }: GoogleMapProps) {
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-gray-200 ${className}`} style={{ height }}>
      <iframe
        title="Gül-Tekin Mühendislik konumu - Yalıkavak, Bodrum"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={CONTACT_INFO.googleMaps.embedUrl}
      />
    </div>
  );
}