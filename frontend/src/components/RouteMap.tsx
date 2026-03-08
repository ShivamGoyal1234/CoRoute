import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useLoadScript,
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { geocodeToLatLng } from '../utils/geocode';
import type { Trip, Activity, Day } from '../types';

const MAP_STYLE = { width: '100%', height: '100%', minHeight: 280 };
const DEFAULT_CENTER = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 2;

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  food: 'Food',
  shop: 'Shopping',
  other: 'Other',
};

interface ExpenseWithPosition {
  activity: Activity;
  position: { lat: number; lng: number };
}

interface RouteMapProps {
  trip: Trip | null;
  activitiesByDay: Record<string, Activity[]>;
  days: Day[];
  className?: string;
  style?: React.CSSProperties;
}

export function RouteMap({
  trip,
  activitiesByDay,
  days,
  className = '',
  style = { minHeight: 400 },
}: RouteMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [expensePositions, setExpensePositions] = useState<Record<string, { lat: number; lng: number }>>({});
  const [geocodeLoading, setGeocodeLoading] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    preventGoogleFontsLoading: true,
  });

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
      ],
    }),
    []
  );

  const center = useMemo((): google.maps.LatLngLiteral => {
    if (trip?.location) return { lat: trip.location.lat, lng: trip.location.lng };
    return DEFAULT_CENTER;
  }, [trip?.location]);

  const expensesWithCost = useMemo(() => {
    const list: Activity[] = [];
    days.forEach((d) => {
      (activitiesByDay[d._id] ?? []).forEach((a) => {
        if (a.cost != null && a.cost > 0) list.push(a);
      });
    });
    return list;
  }, [days, activitiesByDay]);

  useEffect(() => {
    if (!trip?.destination) return;
    setEndAddress((prev) => (prev ? prev : trip.destination ?? ''));
  }, [trip?.destination]);

  const directionsCallback = useCallback(
    (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === 'OK' && result) {
        setDirections(result);
      } else {
        setDirections(null);
      }
    },
    []
  );

  const directionsRequest = useMemo(
    () =>
      origin && destination
        ? {
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
          }
        : null,
    [origin?.lat, origin?.lng, destination?.lat, destination?.lng]
  );

  const handleShowRoute = useCallback(async () => {
    if (!startAddress.trim() || !endAddress.trim()) return;
    setGeocodeLoading(true);
    setDirections(null);
    try {
      const [startLoc, endLoc] = await Promise.all([
        geocodeToLatLng(startAddress.trim()),
        geocodeToLatLng(endAddress.trim()),
      ]);
      setOrigin(startLoc);
      setDestination(endLoc);
    } finally {
      setGeocodeLoading(false);
    }
  }, [startAddress, endAddress]);

  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.Geocoder || expensesWithCost.length === 0) {
      return;
    }
    const needGeocode = expensesWithCost.filter(
      (a) => !a.coordinates?.lat && !a.coordinates?.lng && a.location?.trim()
    );
    if (needGeocode.length === 0) {
      const withPos: Record<string, { lat: number; lng: number }> = {};
      expensesWithCost.forEach((a) => {
        if (a.coordinates?.lat != null && a.coordinates?.lng != null) {
          withPos[a._id] = { lat: a.coordinates.lat, lng: a.coordinates.lng };
        }
      });
      setExpensePositions((prev) => (JSON.stringify(prev) === JSON.stringify(withPos) ? prev : withPos));
      return;
    }
    let cancelled = false;
    const next: Record<string, { lat: number; lng: number }> = {};
    expensesWithCost.forEach((a) => {
      if (a.coordinates?.lat != null && a.coordinates?.lng != null) {
        next[a._id] = { lat: a.coordinates.lat, lng: a.coordinates.lng };
      }
    });
    const fallbackSuffix = trip?.destination?.trim() ? `, ${trip.destination.trim()}` : ', Japan';
    Promise.all(
      needGeocode.map(async (a) => {
        const address = a.location!.trim();
        let loc = await geocodeToLatLng(address);
        if (!loc && fallbackSuffix) {
          loc = await geocodeToLatLng(`${address}${fallbackSuffix}`);
        }
        return { id: a._id, loc };
      })
    ).then((results) => {
      if (cancelled) return;
      results.forEach(({ id, loc }) => {
        if (loc) next[id] = loc;
      });
      setExpensePositions((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, expensesWithCost, trip?.destination]);

  const NUDGE_DEG = 0.002;

  const expensesWithPosition = useMemo((): ExpenseWithPosition[] => {
    return expensesWithCost
      .map((activity) => {
        const pos = expensePositions[activity._id] ?? activity.coordinates;
        if (!pos) return null;
        let position = pos;
        if (origin && Math.abs(pos.lat - origin.lat) < 1e-5 && Math.abs(pos.lng - origin.lng) < 1e-5) {
          position = { lat: pos.lat + NUDGE_DEG, lng: pos.lng };
        } else if (destination && Math.abs(pos.lat - destination.lat) < 1e-5 && Math.abs(pos.lng - destination.lng) < 1e-5) {
          position = { lat: pos.lat - NUDGE_DEG, lng: pos.lng };
        }
        return { activity, position };
      })
      .filter((x): x is ExpenseWithPosition => x != null);
  }, [expensesWithCost, expensePositions, origin, destination]);

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

  const currency = trip?.baseCurrency ?? 'USD';

  return (
    <div className={`flex flex-col gap-4 ${className}`} style={style}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600">Start</span>
          <input
            type="text"
            placeholder="Start point address"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-w-[200px]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-600">Destination</span>
          <input
            type="text"
            placeholder="Destination address"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-w-[200px]"
          />
        </label>
        <button
          type="button"
          onClick={handleShowRoute}
          disabled={geocodeLoading || !startAddress.trim() || !endAddress.trim()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {geocodeLoading ? 'Finding route…' : 'Show route'}
        </button>
      </div>

      <div className="flex-1 min-h-[320px] rounded-xl overflow-hidden border border-slate-200">
        <GoogleMap
          mapContainerStyle={MAP_STYLE}
          center={origin ?? destination ?? center}
          zoom={directions ? undefined : origin && destination ? 10 : DEFAULT_ZOOM}
          options={mapOptions}
        >
          {directionsRequest && (
            <DirectionsService options={directionsRequest} callback={directionsCallback} />
          )}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ suppressMarkers: true }}
            />
          )}

          {origin && (
            <Marker
              position={origin}
              label={{ text: 'A', color: '#fff', fontSize: '12px' }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#22c55e',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
            />
          )}
          {destination && (
            <Marker
              position={destination}
              label={{ text: 'B', color: '#fff', fontSize: '12px' }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#ea580c',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
            />
          )}

          {expensesWithPosition.map(({ activity, position }) => (
            <Marker
              key={activity._id}
              position={position}
              zIndex={100}
              onClick={() => setSelectedActivityId(activity._id)}
              label={{
                text: `${currency === 'USD' ? '$' : currency + ' '}${(activity.cost ?? 0).toFixed(0)}`,
                color: '#fff',
                fontSize: '10px',
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: activity.expenseCategory === 'food' ? '#22c55e' : activity.expenseCategory === 'shop' ? '#3b82f6' : '#f59e0b',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
            />
          ))}

          {selectedActivityId && (() => {
            const item = expensesWithPosition.find((x) => x.activity._id === selectedActivityId);
            if (!item) return null;
            const { activity } = item;
            const placeName = activity.title;
            const address = activity.location?.trim();
            const category = activity.expenseCategory ? EXPENSE_CATEGORY_LABELS[activity.expenseCategory] ?? activity.expenseCategory : 'Other';
            const amount = `${currency === 'USD' ? '$' : ''}${(activity.cost ?? 0).toFixed(2)}${currency !== 'USD' ? ' ' + currency : ''}`;
            return (
              <InfoWindow
                position={item.position}
                onCloseClick={() => setSelectedActivityId(null)}
                options={{
                  pixelOffset: new google.maps.Size(0, -10),
                }}
              >
                <div
                  style={{
                    minWidth: 240,
                    maxWidth: 320,
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    fontFamily: 'system-ui, sans-serif',
                    overflow: 'visible',
                    wordWrap: 'break-word',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1e293b', wordBreak: 'break-word' }}>{placeName}</p>
                  {address && placeName !== address && (
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b', wordBreak: 'break-word' }}>{address}</p>
                  )}
                  <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#475569' }}>Category: {category}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>Amount spent: {amount}</p>
                </div>
              </InfoWindow>
            );
          })()}
        </GoogleMap>
      </div>


      {expensesWithCost.length > 0 && expensesWithPosition.length === 0 && (
        <p className="text-xs text-amber-600">Loading expense locations…</p>
      )}
      {expensesWithPosition.length > 0 && (
        <p className="text-xs text-slate-500">
          {expensesWithPosition.length} expense marker{expensesWithPosition.length !== 1 ? 's' : ''} on the map. Click a marker for details.
        </p>
      )}
      {expensesWithCost.length === 0 && (
        <p className="text-xs text-slate-500">
          Add activities with a <strong>cost</strong> and a <strong>location</strong> (e.g. Shibuya, Japan) to see them as markers here.
        </p>
      )}
    </div>
  );
}
