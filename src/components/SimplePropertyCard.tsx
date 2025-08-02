import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Ruler, 
  Users
} from "lucide-react";

export interface Property {
  id: string;
  title: string;
  description: string;
  price_monthly: number;
  area_sqm: number;
  rooms: string;
  address: string;
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
            <div className="relative sm:w-72 lg:w-80 sm:flex-shrink-0 h-full">
              <div className="h-48 sm:h-full overflow-hidden cursor-pointer">
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-xl text-foreground line-clamp-1 mb-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{property.address}, {property.city?.name || 'Stadt nicht verfügbar'}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {formatPrice(property.price_monthly)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">pro Monat</div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{property.area_sqm} m²</div>
                    <div className="text-xs text-muted-foreground">Wohnfläche</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{property.rooms} Zimmer</div>
                    <div className="text-xs text-muted-foreground">Räume</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50">
              <Link to={`/immobilie/${property.id}`} className="block">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto px-6 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Details ansehen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};