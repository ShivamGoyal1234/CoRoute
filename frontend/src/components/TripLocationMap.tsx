import { useMemo } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import type { TripLocation } from '../types';

const MAP_STYLE = { width: '100%', height: '100%', minHeight: 200 };

interface TripLocationMapProps {
  location: TripLocation | null | undefined;
  className?: string;
  style?: React.CSSProperties;
  showZoomControl?: boolean;
}

export function TripLocationMap({
  location,
  className = '',
  style = { minHeight: 280 },
  showZoomControl = true,
}: TripLocationMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    preventGoogleFontsLoading: true,
  });

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: showZoomControl,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
      ],
    }),
    [showZoomControl]
  );

  if (!location?.lat || !location?.lng) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border bg-slate-50 ${className}`}
        style={{ ...style, borderColor: 'rgba(226, 232, 240, 0.8)' }}
      >
        <p className="text-sm text-slate-500 px-4 text-center">
          Add a destination when creating or editing the trip to see the map.
        </p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border bg-slate-100 ${className}`}
        style={style}
      >
        <p className="text-xs text-slate-500">Set VITE_GOOGLE_MAPS_API_KEY to show the map.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border bg-slate-100 ${className}`}
        style={style}
      >
        <p className="text-xs text-slate-500">Map could not be loaded.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border bg-slate-100 animate-pulse ${className}`}
        style={style}
      >
        <span className="text-xs text-slate-400">Loading map…</span>
      </div>
    );
  }

  const center = { lat: location.lat, lng: location.lng };
  const zoom = location.zoom ?? 11;

  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={style}>
      <GoogleMap
        mapContainerStyle={MAP_STYLE}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}
