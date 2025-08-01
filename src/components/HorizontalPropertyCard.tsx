import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Euro, 
  Ruler, 
  Users, 
  Calendar,
  Car,
  ArrowUp,
  CheckCircle
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
  city: { name: string };
  property_type: { name: string };
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

interface HorizontalPropertyCardProps {
  property: Property;
}

export const HorizontalPropertyCard = ({ property }: HorizontalPropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
      <div className="flex flex-col md:flex-row min-h-[200px] md:h-auto">
        {/* Image */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <div className="aspect-[16/10] md:aspect-[4/3] md:h-56 overflow-hidden">
            <img
              src={property.images[0] || '/placeholder.svg'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.is_featured && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                Empfohlen
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                {property.property_type.name}
              </Badge>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {property.city.name}, {property.neighborhood}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold text-foreground">
                {formatPrice(property.price_monthly)}
              </div>
              <div className="text-xs text-muted-foreground">pro Monat</div>
            </div>
          </div>

          {/* Title and Address */}
          <div className="mb-4">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 line-clamp-1">
              {property.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {property.address}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Ruler className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">{property.area_sqm} m²</div>
              <div className="text-xs text-muted-foreground">Wohnfläche</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">{property.rooms} Zimmer</div>
              <div className="text-xs text-muted-foreground">Räume</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">ab {formatDate(property.available_from)}</div>
              <div className="text-xs text-muted-foreground">Verfügbar</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">{property.floor}. OG</div>
              <div className="text-xs text-muted-foreground">Etage</div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-3 mb-4">
            {property.balcony && (
              <div className="flex items-center text-xs font-medium text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Balkon
              </div>
            )}
            {property.elevator && (
              <div className="flex items-center text-xs font-medium text-blue-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                Aufzug
              </div>
            )}
            {property.furnished && (
              <div className="text-xs font-medium text-purple-600">
                Möbliert
              </div>
            )}
          </div>

          {/* Description and Button */}
          <div className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {property.description}
            </p>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="hover-scale">
                Details ansehen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};