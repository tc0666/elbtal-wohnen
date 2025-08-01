import React from 'react';
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
      {/* Description only */}
      <div>
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