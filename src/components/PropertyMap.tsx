import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  city: string;
  className?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ address, city, className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // Free geocoding using Nominatim (OpenStreetMap)
  const geocodeAddress = async (fullAddress: string): Promise<Coordinates | null> => {
    try {
      console.log('🗺️ [GEOCODING] Starting for:', fullAddress);
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=de&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PropertyMap/1.0 (Real Estate App)'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🗺️ [GEOCODING] Response received:', data);
      
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log('🗺️ [GEOCODING] Success:', coords);
        return coords;
      }
      
      console.log('🗺️ [GEOCODING] No results found');
      return null;
    } catch (error) {
      console.error('🗺️ [GEOCODING] Error:', error);
      return null;
    }
  };

  const loadLeafletCSS = (): Promise<void> => {
    return new Promise((resolve) => {
      // Check if CSS is already loaded
      if (document.querySelector('link[href*="leaflet"]')) {
        console.log('🗺️ [CSS] Already loaded');
        resolve();
        return;
      }

      console.log('🗺️ [CSS] Loading from CDN...');
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      link.crossOrigin = 'anonymous';
      
      link.onload = () => {
        console.log('🗺️ [CSS] Loaded successfully');
        resolve();
      };
      
      link.onerror = () => {
        console.warn('🗺️ [CSS] CDN failed, trying unpkg...');
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        fallbackLink.onload = () => resolve();
        fallbackLink.onerror = () => {
          console.warn('🗺️ [CSS] All sources failed, continuing without CSS');
          resolve();
        };
        document.head.appendChild(fallbackLink);
      };
      
      document.head.appendChild(link);
      
      // Always resolve after timeout
      setTimeout(() => {
        console.log('🗺️ [CSS] Timeout - continuing');
        resolve();
      }, 2000);
    });
  };

  const initializeMap = async () => {
    try {
      console.log('🗺️ [INIT] Starting map initialization');
      console.log('🗺️ [INIT] Address:', address, 'City:', city);
      console.log('🗺️ [INIT] Container exists:', !!mapContainer.current);
      
      setLoading(true);
      setError('');

      // Step 1: Try to geocode the specific address first
      let coords = await geocodeAddress(`${address}, ${city}, Germany`);
      
      // Step 2: If specific address fails, try just the city
      if (!coords) {
        console.log('🗺️ [INIT] Specific address failed, trying city only');
        coords = await geocodeAddress(`${city}, Germany`);
      }

      if (!coords) {
        throw new Error('Standort konnte nicht gefunden werden');
      }

      setCoordinates(coords);
      console.log('🗺️ [INIT] Coordinates set:', coords);

      // Step 2: Load Leaflet CSS
      await loadLeafletCSS();

      // Step 3: Wait for container to be ready with better checking
      let attempts = 0;
      while (!mapContainer.current && attempts < 10) {
        console.log(`🗺️ [INIT] Waiting for container... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!mapContainer.current) {
        throw new Error('Map container not available after waiting');
      }

      console.log('🗺️ [INIT] Container ready, loading Leaflet...');

      // Step 4: Dynamic import of Leaflet
      const L = await import('leaflet');
      console.log('🗺️ [INIT] Leaflet imported successfully');

      // Step 5: Clear existing map
      if (mapInstance.current) {
        console.log('🗺️ [INIT] Removing existing map');
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      mapContainer.current.innerHTML = '';

      // Step 6: Fix default markers with CDN fallback
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Step 7: Create map
      console.log('🗺️ [INIT] Creating map instance...');
      const map = L.map(mapContainer.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true
      });

      mapInstance.current = map;
      console.log('🗺️ [INIT] Map created');

      // Step 8: Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      console.log('🗺️ [INIT] Tiles added');

      // Step 9: Add marker
      const marker = L.marker([coords.lat, coords.lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${address}</h3>
          <p style="margin: 0; color: #666; font-size: 12px;">${city}</p>
        </div>
      `);

      console.log('🗺️ [INIT] Marker added');

      // Step 10: Force map to resize and fit
      setTimeout(() => {
        map.invalidateSize();
        console.log('🗺️ [INIT] Map resized');
      }, 100);

      setLoading(false);
      console.log('🗺️ [INIT] Map initialization complete!');

    } catch (err) {
      console.error('🗺️ [INIT] Initialization failed:', err);
      setError(`Karte konnte nicht geladen werden: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
      setLoading(false);
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (mapInstance.current) {
      console.log('🗺️ [CLEANUP] Removing map instance');
      mapInstance.current.remove();
      mapInstance.current = null;
    }
  };

  useEffect(() => {
    console.log('🗺️ [EFFECT] useEffect triggered');
    console.log('🗺️ [EFFECT] Address:', address, 'City:', city);
    
    if (!address || !city) {
      console.log('🗺️ [EFFECT] Missing address or city');
      return;
    }

    // Wait for the container to be mounted and visible
    const checkAndInit = () => {
      if (mapContainer.current) {
        console.log('🗺️ [EFFECT] Container found, starting initialization');
        initializeMap();
      } else {
        console.log('🗺️ [EFFECT] Container not ready, waiting longer...');
        setTimeout(checkAndInit, 200);
      }
    };

    // Initial delay to let React finish rendering
    const timer = setTimeout(checkAndInit, 300);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [address, city]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  if (loading) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center min-h-[300px] ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Karte wird geladen...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {address}, {city}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center min-h-[300px] ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {error}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {address}, {city}
          </p>
          <button 
            onClick={initializeMap}
            className="text-xs text-primary hover:underline bg-background px-3 py-1 rounded border"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border min-h-[300px] ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-full min-h-[300px]"
        style={{ minHeight: '300px' }}
      />
      {coordinates && (
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded shadow-sm">
          {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default PropertyMap;