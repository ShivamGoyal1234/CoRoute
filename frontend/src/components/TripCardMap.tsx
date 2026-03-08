import { useMemo } from 'react';
import { useLoadScript, GoogleMap } from '@react-google-maps/api';

const PRESET_CENTERS: { lat: number; lng: number; zoom: number }[] = [
  { lat: 35.6762, lng: 139.6503, zoom: 11 }, // Tokyo
  { lat: 48.8566, lng: 2.3522, zoom: 11 },   // Paris
  { lat: 45.9237, lng: 6.8694, zoom: 10 },  // Alps
  { lat: 43.7102, lng: 7.262, zoom: 11 },   // Coastal (Nice)
];

const CARD_MAP_STYLE = { width: '100%', height: '100%', minHeight: 140 };

export interface MapCenter {
  lat: number;
  lng: number;
}

interface TripCardMapProps {
  /** Index to pick a preset center so cards get varied maps (used when center is not provided) */
  index?: number;
  /** Exact center from geocoding – when set, overrides index */
  center?: MapCenter;
  /** Zoom level when using center (default 12) */
  zoom?: number;
  className?: string;
}

export function TripCardMap({ index = 0, center: centerProp, zoom: zoomProp, className = '' }: TripCardMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    preventGoogleFontsLoading: true,
  });

  const { center, zoom } = useMemo(() => {
    if (centerProp) {
      return { center: centerProp, zoom: zoomProp ?? 12 };
    }
    const preset = PRESET_CENTERS[Math.abs(index) % PRESET_CENTERS.length];
    return { center: { lat: preset.lat, lng: preset.lng }, zoom: preset.zoom };
  }, [index, centerProp, zoomProp]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    }),
    []
  );

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-t-xl ${className}`}
        style={{ minHeight: 140 }}
      >
        <span className="text-xs text-slate-500">Map</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-t-xl ${className}`}
        style={{ minHeight: 140 }}
      >
        <span className="text-xs text-slate-500">Map</span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-t-xl animate-pulse ${className}`}
        style={{ minHeight: 140 }}
      >
        <span className="text-xs text-slate-400">…</span>
      </div>
    );
  }

  return (
    <div className={`rounded-t-xl overflow-hidden ${className}`} style={{ minHeight: 140 }}>
      <GoogleMap
        mapContainerStyle={CARD_MAP_STYLE}
        center={center}
        zoom={zoom}
        options={mapOptions}
      />
    </div>
  );
}
