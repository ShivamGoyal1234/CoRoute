## Trip Recommendations Feature – End‑to‑End Roadmap

### 1. Product & UX Definition

- **Goal**: Show “Recommended near your trip” places on Trip Detail.
- **Audience**: Trip owners and members; primarily for upcoming trips.
- **Placement (v1)**:
  - In the **Itinerary** section of `/trips/:id`.
  - Directly **under the map / header**, above the day‑by‑day timeline.
  - Layout:
    - Tabs: `Recommended · Saved · Nearby`.
    - Section title: “Popular near your hotel”.
    - Vertical card list matching the reference design (image, title, meta, price).
- **Data we want per place**:
  - Name, category/label, distance or “x min walk/drive”.
  - Image URL, rating (optional), price level.
  - Coordinates (lat/lng), provider id, “saved” status.

---

### 2. External Places API – Selection & Spike

- **Pick a single provider for v1** (Google Places or Foursquare Places).
- **Create a spike**:
  - Small Node script or temporary endpoint:
    - Input: `lat,lng`.
    - Output: 5–10 places normalized to:
      ```ts
      type TripPlaceSuggestion = {
        provider: 'google' | 'foursquare';
        providerId: string;
        name: string;
        category: string;
        distanceMeters: number;
        imageUrl?: string;
        rating?: number;
        priceLevel?: number;
        coordinates: { lat: number; lng: number };
      };
      ```
  - Verify: images render well, data is stable, quotas are acceptable.
- **Decide quotas/cost controls**:
  - Max lookups per trip per day.
  - Caching strategy (see Phase 6).

---

### 3. Backend Design

#### 3.1 Data model

- **New collection** `TripPlace` (saved places per trip):
  ```ts
  interface TripPlace {
    _id: ObjectId;
    tripId: ObjectId;
    provider: 'google' | 'foursquare';
    providerPlaceId: string;
    name: string;
    category?: string;
    imageUrl?: string;
    priceLevel?: number;
    coordinates: { lat: number; lng: number };
    createdBy: ObjectId;
    createdAt: Date;
  }
  ```

#### 3.2 Endpoints

- `GET /trips/:id/recommendations?tab=recommended|saved|nearby`
  - Load trip → read `location`/`destination`.
  - `recommended` / `nearby`:
    - Hit cache first.
    - If miss, call external Places API, normalize results, store in cache, return.
  - `saved`:
    - Query `TripPlace` by `tripId`.
  - Response:
    ```ts
    { places: TripPlaceSuggestion[] }
    ```

- `POST /trips/:id/places`
  - Body: minimal place payload:
    ```ts
    {
      provider: 'google' | 'foursquare';
      providerPlaceId: string;
      name: string;
      category?: string;
      imageUrl?: string;
      priceLevel?: number;
      coordinates: { lat: number; lng: number };
    }
    ```
  - Creates `TripPlace` if not already saved for this `tripId` + `providerPlaceId`.

- `DELETE /trips/:id/places/:placeId`
  - Soft authorization: only trip members; stricter: only owner/editor.

#### 3.3 Security

- Re‑use existing `authenticate` middleware.
- New authorization helper: `assertTripMember(tripId, userId)` for all of the above endpoints.

---

### 4. Frontend Integration (Itinerary)

#### 4.1 API client (`frontend/src/lib/api.ts`)

- Extend `tripsApi`:
  ```ts
  getRecommendations: (id: string, tab: 'recommended' | 'saved' | 'nearby') =>
    api.get<{ places: TripPlaceSuggestion[] }>(`/trips/${id}/recommendations`, { params: { tab } });

  savePlace: (tripId: string, payload: SavePlacePayload) =>
    api.post<{ place: TripPlace }>(`/trips/${tripId}/places`, payload);

  deletePlace: (tripId: string, placeId: string) =>
    api.delete(`/trips/${tripId}/places/${placeId}`);
  ```

#### 4.2 `RecommendedPane` component

- New component under `TripDetail` pages, props:
  - `tripId: string`
  - `location?: { lat: number; lng: number }`
- State:
  - `tab: 'recommended' | 'saved' | 'nearby'`
  - `places: TripPlaceSuggestion[]`
  - `loading: boolean`, `error: string | null`
- Behavior:
  - `useEffect` on mount and on `tab` change → `tripsApi.getRecommendations`.
  - Render:
    - Tab bar (underline active tab).
    - Heading: “Popular near your hotel”.
    - List of cards matching the provided design:
      - Big image.
      - Title, category, distance text.
      - Price / free label on the right.
      - Heart icon for save/unsave.
  - Clicking heart:
    - If not saved → call `savePlace`, optimistically update UI.
    - If saved → call `deletePlace`, optimistically update UI.

#### 4.3 Placement in `ItinerarySection`

- In `TripDetail` Itinerary:
  - Under the map area:
    ```tsx
    <RecommendedPane tripId={trip._id} location={trip.location} />
    ```
  - Then render the existing day‑by‑day timeline as is.

---

### 5. Map Integration

- **Goal**: clicking a place card or “View on map” should recenter the existing trip map.
- Expose from map component:
  - `focusOnCoordinates(lat, lng)` function.
- Wiring:
  - Use React context or a prop function passed down to `RecommendedPane`.
  - On card click → call `focusOnCoordinates(place.coordinates.lat, place.coordinates.lng)`.

---

### 6. Performance, Caching, and Rate Limits

- **Server‑side caching**
  - New collection `TripRecommendationsCache`:
    ```ts
    {
      _id,
      tripId,
      tab: 'recommended' | 'nearby',
      places: TripPlaceSuggestion[],
      fetchedAt: Date,
      expiresAt: Date, // TTL index
    }
    ```
  - TTL index on `expiresAt` (e.g., 6–24 hours).
  - `GET /trips/:id/recommendations`:
    - Check cache first; if fresh, return it.
    - Else, call provider, store, return.

- **Client‑side**
  - Keep places in component state per tab.
  - Don’t re‑fetch when toggling hearts; only when user changes tab or manually refreshes.

- **Rate limits**
  - Optionally add an Express rate‑limit middleware for recommendations endpoint.
  - Monitor provider quotas and costs.

---

### 7. UX Details & Error States

- **Loading**:
  - Skeleton cards or shimmer while fetching recommendations.
- **Empty states**:
  - `Recommended`/`Nearby`: “No recommendations yet. Try updating your trip location.”
  - `Saved`: “You haven’t saved any places yet.”
- **Errors**:
  - Show non‑blocking inline error message if external API fails.
  - Keep itinerary functional even when recommendations are down.
- **Mobile behavior**:
  - Ensure cards scroll smoothly on smaller screens.
  - Tabs remain sticky under the map on mobile if possible.

---

### 8. Analytics & Iteration

- **Events to track**:
  - Recommendations section viewed (per trip).
  - Card clicked (view on map).
  - Place saved / unsaved.
  - Tab switches (`Recommended`, `Saved`, `Nearby`).
- **Use metrics to refine**:
  - Popular categories → adjust provider query filters.
  - Low engagement → experiment with ranking, copy, or placement.

---

### 9. Hardening & Rollout

- **Configuration**
  - Provider API keys in env: `PLACES_API_KEY`, etc.
  - Feature flag (env or config) to disable recommendations quickly per environment.
- **Testing**
  - Unit tests:
    - Normalization of provider responses.
    - Caching logic.
  - Integration tests:
    - Trip with valid location returns cards.
    - Saved places appear in `Saved` tab and survive reload.
  - Visual regression / responsive checks.
- **Rollout plan**
  - Enable in dev → staging → production.
  - Optionally limit to internal users / selected trips at first.
  - Monitor logs, provider usage, and feedback.

