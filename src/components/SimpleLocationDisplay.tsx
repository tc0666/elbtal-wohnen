import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface SimpleLocationDisplayProps {
  address: string;
  city: string;
  postalCode?: string;
  neighborhood?: string;
  className?: string;
}

const SimpleLocationDisplay: React.FC<SimpleLocationDisplayProps> = ({ 
  address, 
  city, 
  postalCode, 
  neighborhood, 
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Header */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground mb-1">
            <Navigation className="h-4 w-4 inline mr-1" />
            {address}
          </div>
          <div className="text-sm text-muted-foreground">
            {postalCode && `${postalCode} `}
            <span className="font-medium text-foreground">{city}</span>
            {neighborhood && (
              <>
                <span className="mx-1">•</span>
                <span>{neighborhood}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Diese Immobilie befindet sich in einer sehr begehrten Wohnlage mit exzellenter 
          Infrastruktur. In unmittelbarer Nähe finden Sie Einkaufsmöglichkeiten, Restaurants, 
          Schulen und öffentliche Verkehrsmittel.
        </p>
      </div>
    </div>
  );
};

export default SimpleLocationDisplay;