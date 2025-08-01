import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  PawPrint
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

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || '/placeholder.svg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {property.is_featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            Empfohlen
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(property.price_monthly)}/Monat
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Property Type & Location */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {property.property_type.name}
          </Badge>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {property.city.name}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {property.title}
        </h3>

        {/* Address */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {property.address}, {property.neighborhood}
        </p>

        {/* Key Details */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center text-sm">
            <Ruler className="h-4 w-4 mr-1 text-primary" />
            <span>{property.area_sqm} m²</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-1 text-primary" />
            <span>{property.rooms} Zimmer</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1 text-primary" />
            <span>ab {formatDate(property.available_from)}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {property.balcony && (
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Balkon
            </div>
          )}
          {property.elevator && (
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1" />
              Aufzug
            </div>
          )}
          {property.parking && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Car className="h-3 w-3 mr-1" />
              Parkplatz
            </div>
          )}
          {property.pets_allowed && (
            <div className="flex items-center text-xs text-muted-foreground">
              <PawPrint className="h-3 w-3 mr-1" />
              Haustiere
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {property.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline">
          Details ansehen
        </Button>
      </CardFooter>
    </Card>
  );
};