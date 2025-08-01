import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  city: string;
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ address, city, className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Geocoding function to get coordinates from address
  const geocodeAddress = async (fullAddress: string, token: string): Promise<[number, number] | null> => {
    try {
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&country=DE&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return [lng, lat];
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Get Mapbox token from Supabase secrets
  const getMapboxToken = async () => {
    try {
      // Try to get token from Supabase Edge Function secrets
      const response = await fetch('/api/mapbox-token');
      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
    } catch (error) {
      console.log('Could not fetch token from secrets');
    }
    
    // Fallback: prompt user for token
    const userToken = prompt(
      'Please enter your Mapbox public token. You can get one from https://mapbox.com/ in your dashboard under Tokens section.'
    );
    
    if (userToken) {
      localStorage.setItem('mapbox_token', userToken);
      return userToken;
    }
    
    // Try to get from localStorage
    return localStorage.getItem('mapbox_token');
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        setLoading(true);
        setError('');

        // Get Mapbox token
        const token = await getMapboxToken();
        
        if (!token) {
          setError('Mapbox token is required. Please get one from https://mapbox.com/');
          setLoading(false);
          return;
        }

        setMapboxToken(token);
        mapboxgl.accessToken = token;

        // Geocode the address
        const fullAddress = `${address}, ${city}, Germany`;
        const coordinates = await geocodeAddress(fullAddress, token);

        if (!coordinates) {
          setError('Could not find location for this address');
          setLoading(false);
          return;
        }

        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: coordinates,
          zoom: 15,
          pitch: 0,
        });

        // Add marker for the property
        new mapboxgl.Marker({
          color: '#3b82f6',
          scale: 1.2,
        })
          .setLngLat(coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <h3 class="font-semibold">${address}</h3>
                <p class="text-sm text-gray-600">${city}</p>
              </div>`
            )
          )
          .addTo(map.current);

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );

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
      map.current?.remove();
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
    </div>
  );
};

export default PropertyMap;