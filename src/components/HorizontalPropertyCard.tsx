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
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex">
        {/* Image */}
        <div className="relative w-72 flex-shrink-0">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={property.images[0] || '/placeholder.svg'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.is_featured && (
              <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">
                Empfohlen
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          {/* Header with Type, Location and Price */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                {property.property_type.name}
              </Badge>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {property.city.name}, {property.neighborhood}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {formatPrice(property.price_monthly)}
              </div>
              <div className="text-xs text-muted-foreground">pro Monat</div>
            </div>
          </div>

          {/* Title and Address */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-foreground mb-1">
              {property.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {property.address}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Ruler className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">{property.area_sqm} m²</div>
              <div className="text-xs text-muted-foreground">Wohnfläche</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">{property.rooms} Zimmer</div>
              <div className="text-xs text-muted-foreground">Räume</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">ab {formatDate(property.available_from)}</div>
              <div className="text-xs text-muted-foreground">Verfügbar</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-sm">{property.floor}. OG</div>
              <div className="text-xs text-muted-foreground">Etage</div>
            </div>
          </div>

          {/* Features */}
          <div className="flex gap-4 mb-4">
            {property.balcony && (
              <div className="flex items-center text-xs font-medium text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
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
            {property.parking && (
              <div className="flex items-center text-xs font-medium text-orange-600">
                <Car className="h-3 w-3 mr-1" />
                Parkplatz
              </div>
            )}
          </div>

          {/* Description and Button */}
          <div className="flex items-end justify-between">
            <p className="text-sm text-muted-foreground flex-1 mr-4 line-clamp-2">
              {property.description}
            </p>
            <Button variant="outline" size="sm" className="shrink-0">
              Details ansehen
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};