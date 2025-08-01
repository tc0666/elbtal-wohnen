import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Import Leaflet CSS directly in the component
const CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

// Ensure CSS is loaded
if (typeof window !== 'undefined' && !document.querySelector(`link[href="${CSS_URL}"]`)) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
}

// Fix for default markers in Leaflet with CDN URLs
if (typeof window !== 'undefined' && (L.Icon.Default.prototype as any)._getIconUrl) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  const map = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Free geocoding using Nominatim (OpenStreetMap)
  const geocodeAddress = async (fullAddress: string): Promise<Coordinates | null> => {
    try {
      console.log('Geocoding address:', fullAddress);
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=de&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PropertyMap/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        console.log('Found coordinates:', coords);
        return coords;
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        setLoading(true);
        setError('');
        console.log('Initializing map for:', address, city);

        // Wait a bit for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100));

        // Geocode the address using free Nominatim service
        const fullAddress = `${address}, ${city}, Germany`;
        const coordinates = await geocodeAddress(fullAddress);

        if (!coordinates) {
          console.error('No coordinates found for address');
          setError('Could not find location for this address');
          setLoading(false);
          return;
        }

        console.log('Creating map with coordinates:', coordinates);
        
        // Initialize map with OpenStreetMap tiles (completely free)
        map.current = L.map(mapContainer.current, {
          center: [coordinates.lat, coordinates.lng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true
        });

        // Add OpenStreetMap tile layer (free)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);

        // Add marker for the property
        const marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map.current);
        
        // Add popup to marker
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${address}</h3>
            <p style="margin: 0; color: #666; font-size: 12px;">${city}</p>
          </div>
        `).openPopup();

        setLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to load map');
        setLoading(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [address, city]);

  if (loading) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Karte wird geladen...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {error}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {address}, {city}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded shadow-sm">
        OpenStreetMap
      </div>
    </div>
  );
};

export default PropertyMap;