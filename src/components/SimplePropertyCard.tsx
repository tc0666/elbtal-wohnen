import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Link } from "react-router-dom";
import { 
  MapPin 
} from "lucide-react";

export interface Property {
  id: string;
  title: string;
  description: string;
  price_monthly: number;
  area_sqm: number;
  rooms: string;
  address: string;
  postal_code?: string;
  neighborhood: string;
  city: { name: string } | null;
  property_type: { name: string } | null;
  floor: number;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  pets_allowed: boolean;
  furnished: boolean;
  available_from: string;
  images: string[];
  features: string[];
  is_featured: boolean;
}

interface SimplePropertyCardProps {
  property: Property;
}

export const SimplePropertyCard = ({ property }: SimplePropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border border-border/50 hover:border-primary/20">
      <CardContent className="p-0 h-full">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image */}
          <Link to={`/immobilie/${property.id}`} className="block overflow-hidden">
            <div className="relative w-full sm:w-60 lg:w-72 sm:flex-shrink-0 h-56 sm:h-48">
              <div className="w-full h-full overflow-hidden cursor-pointer">
                <img
                  src={property.images[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {property.is_featured && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg">
                    Empfohlen
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
            <div className="space-y-3 sm:space-y-4">
              {/* Header */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-[hsl(var(--brand-blue))] line-clamp-1 mb-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{`${property.postal_code ? property.postal_code + ' ' : ''}${property.city?.name || 'Stadt nicht verfügbar'}`}</span>
                    </div>
                  </div>
                  {/* Price - only show on desktop */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">
                      {formatPrice(property.price_monthly)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Warmmiete</div>
                  </div>
                </div>

                {/* Mobile: Price, Size, Rooms in same row */}
                <div className="grid grid-cols-3 gap-3 sm:hidden">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {formatPrice(property.price_monthly)}
                    </div>
                    <div className="text-xs text-muted-foreground">Warmmiete</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-medium text-sm">{property.area_sqm} m²</div>
                      <div className="text-xs text-muted-foreground">Fläche</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-medium text-sm">{property.rooms}</div>
                      <div className="text-xs text-muted-foreground">Zimmer</div>
                    </div>
                  </div>
                </div>

                {/* Desktop: Size and Rooms in same row */}
                <div className="hidden sm:flex sm:items-center sm:gap-6">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-sm">{property.area_sqm} m²</div>
                          <div className="text-xs text-muted-foreground">Wohnfläche</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-sm">{property.rooms} Zimmer</div>
                          <div className="text-xs text-muted-foreground">Räume</div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
};