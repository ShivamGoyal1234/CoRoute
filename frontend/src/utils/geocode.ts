import type { TripLocation } from '../types';

declare global {
  interface Window {
    google?: {
      maps: {
        Geocoder: new () => {
          geocode: (
            request: { address: string },
            callback: (results: Array<{ geometry?: { location?: { lat: () => number; lng: () => number } } }>, status: string) => void
          ) => void;
        };
      };
    };
  }
}

const DEFAULT_ZOOM = 11;

/**
 * Geocode an address string using Google Maps Geocoder.
 * Requires Google Maps JS API to be loaded (e.g. via useLoadScript).
 * Returns trip location with lat, lng, zoom or null if geocoding fails.
 */
export function geocodeAddress(address: string): Promise<TripLocation | null> {
  return new Promise((resolve) => {
    if (!address?.trim()) {
      resolve(null);
      return;
    }
    const g = window.google;
    if (!g?.maps?.Geocoder) {
      resolve(null);
      return;
    }
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode({ address: address.trim() }, (results, status) => {
      if (status !== 'OK' || !results?.[0]?.geometry?.location) {
        resolve(null);
        return;
      }
      const loc = results[0].geometry!.location!;
      resolve({
        lat: loc.lat(),
        lng: loc.lng(),
        zoom: DEFAULT_ZOOM,
      });
    });
  });
}
