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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // Free geocoding using Nominatim (OpenStreetMap)
  const geocodeAddress = async (fullAddress: string): Promise<Coordinates | null> => {
    try {
      console.log('🗺️ Geocoding address:', fullAddress);
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
      console.log('🗺️ Geocoding response:', data);
      
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log('🗺️ Found coordinates:', coords);
        return coords;
      }
      
      console.log('🗺️ No coordinates found in response');
      return null;
    } catch (error) {
      console.error('🗺️ Geocoding error:', error);
      return null;
    }
  };

  const initializeMap = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🗺️ Starting map initialization for:', address, city);

      // Geocode the address
      const fullAddress = `${address}, ${city}, Germany`;
      const coords = await geocodeAddress(fullAddress);

      if (!coords) {
        setError('Standort konnte nicht gefunden werden');
        setLoading(false);
        return;
      }

      setCoordinates(coords);
      
      // Dynamic import of Leaflet to avoid SSR issues
      const L = await import('leaflet');
      
      console.log('🗺️ Leaflet loaded, creating map...');

      // Ensure CSS is loaded
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        // Wait for CSS to load
        await new Promise(resolve => {
          link.onload = resolve;
          setTimeout(resolve, 1000); // Fallback timeout
        });
      }

      if (!mapContainer.current) {
        console.log('🗺️ Map container not ready, waiting...');
        // Wait for container to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mapContainer.current) {
          console.error('🗺️ Map container still not found after waiting');
          setError('Map container not available');
          setLoading(false);
          return;
        }
      }

      console.log('🗺️ Map container found:', mapContainer.current);

      // Clear any existing map
      mapContainer.current.innerHTML = '';

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Create map
      const map = L.map(mapContainer.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true
      });

      console.log('🗺️ Map created successfully');

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      // Add marker
      const marker = L.marker([coords.lat, coords.lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${address}</h3>
          <p style="margin: 0; color: #666; font-size: 12px;">${city}</p>
        </div>
      `).openPopup();

      console.log('🗺️ Map fully initialized with marker');
      setLoading(false);

    } catch (err) {
      console.error('🗺️ Map initialization error:', err);
      setError(`Karte konnte nicht geladen werden: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a longer delay to ensure the component is fully mounted and visible
    const timer = setTimeout(() => {
      if (address && city && mapContainer.current) {
        console.log('🗺️ Starting delayed map initialization');
        initializeMap();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address, city]);

  if (loading) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
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
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {error}
          </p>
          <p className="text-xs text-muted-foreground">
            {address}, {city}
          </p>
          <button 
            onClick={initializeMap}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[200px]" />
      {coordinates && (
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded shadow-sm">
          {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default PropertyMap;