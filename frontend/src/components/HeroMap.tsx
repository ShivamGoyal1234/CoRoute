import { useMemo } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const TOKYO_CENTER = { lat: 35.6762, lng: 139.6503 };
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%', minHeight: 180 };

const markers: { lat: number; lng: number }[] = [
  { lat: 35.6762, lng: 139.6503 },
  { lat: 35.7101, lng: 139.8107 },
  { lat: 35.6586, lng: 139.7454 },
  { lat: 35.6895, lng: 139.6917 },
];

export function HeroMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    preventGoogleFontsLoading: true,
  });

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
      ],
    }),
    []
  );

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-r-lg" style={{ minHeight: 200 }}>
        <p className="text-xs text-slate-500 px-4 text-center">
          Add <code className="bg-slate-200 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to .env to show the map
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-r-lg" style={{ minHeight: 200 }}>
        <p className="text-xs text-slate-500">Map could not be loaded</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-r-lg animate-pulse" style={{ minHeight: 200 }}>
        <span className="text-xs text-slate-400">Loading map…</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={TOKYO_CENTER}
      zoom={12}
      options={mapOptions}
    >
      {markers.map((pos, i) => (
        <Marker key={i} position={pos} />
      ))}
    </GoogleMap>
  );
}
