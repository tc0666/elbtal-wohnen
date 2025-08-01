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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      <div className="flex h-72">
        {/* Image - Full Height */}
        <div className="relative w-80 flex-shrink-0 h-full">
          <img
            src={property.images[0] || '/placeholder.svg'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {property.is_featured && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary">
              Empfohlen
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-1">
                {property.property_type.name}
              </Badge>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {property.city.name}, {property.neighborhood}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(property.price_monthly)}
              </div>
              <div className="text-sm text-muted-foreground">pro Monat</div>
            </div>
          </div>

          {/* Title and Address */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {property.title}
            </h3>
            <p className="text-muted-foreground">
              {property.address}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div className="font-bold text-lg">{property.area_sqm} m²</div>
              <div className="text-sm text-muted-foreground">Wohnfläche</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="font-bold text-lg">{property.rooms} Zimmer</div>
              <div className="text-sm text-muted-foreground">Räume</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="font-bold text-lg">ab {formatDate(property.available_from)}</div>
              <div className="text-sm text-muted-foreground">Verfügbar</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="font-bold text-lg">{property.floor}. OG</div>
              <div className="text-sm text-muted-foreground">Etage</div>
            </div>
          </div>

          {/* Features */}
          <div className="flex gap-6 mb-6">
            {property.balcony && (
              <div className="flex items-center text-sm font-medium text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Balkon
              </div>
            )}
            {property.elevator && (
              <div className="flex items-center text-sm font-medium text-blue-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                Aufzug
              </div>
            )}
            {property.furnished && (
              <div className="text-sm font-medium text-purple-600">
                Möbliert
              </div>
            )}
          </div>

          {/* Description and Button */}
          <div className="flex-1 flex flex-col justify-between">
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {property.description}
            </p>
            <div className="flex justify-end">
              <Button variant="outline" size="lg" className="px-8">
                Details ansehen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};