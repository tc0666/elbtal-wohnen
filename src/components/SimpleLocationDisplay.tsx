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
    <div className={`bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border ${className}`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2">Standort</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{address}</span>
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

            <div className="mt-4 p-3 bg-background/50 rounded-md border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Diese Immobilie befindet sich in einer sehr begehrten Wohnlage mit exzellenter 
                Infrastruktur. In unmittelbarer Nähe finden Sie Einkaufsmöglichkeiten, Restaurants, 
                Schulen und öffentliche Verkehrsmittel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLocationDisplay;