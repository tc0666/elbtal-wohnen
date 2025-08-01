import { Card, CardContent } from "@/components/ui/card";
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
  PawPrint,
  Star,
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 group">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-80 md:flex-shrink-0">
            <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden">
              <img
                src={property.images[0] || '/placeholder.svg'}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {property.is_featured && (
                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Empfohlen
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {property.property_type.name}
                    </Badge>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.city.name}, {property.neighborhood}
                    </div>
                  </div>
                  <h3 className="font-semibold text-xl mb-1">
                    {property.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {property.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {formatPrice(property.price_monthly)}
                  </div>
                  <div className="text-sm text-muted-foreground">pro Monat</div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <Ruler className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{property.area_sqm} m²</div>
                    <div className="text-xs text-muted-foreground">Wohnfläche</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{property.rooms} Zimmer</div>
                    <div className="text-xs text-muted-foreground">Räume</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">ab {formatDate(property.available_from)}</div>
                    <div className="text-xs text-muted-foreground">Verfügbar</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">{property.floor}. OG</div>
                    <div className="text-xs text-muted-foreground">Etage</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 mb-4">
                {property.balcony && (
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Balkon
                  </div>
                )}
                {property.elevator && (
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Aufzug
                  </div>
                )}
                {property.parking && (
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <Car className="h-3 w-3 mr-1" />
                    Parkplatz
                  </div>
                )}
                {property.pets_allowed && (
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    <PawPrint className="h-3 w-3 mr-1" />
                    Haustiere erlaubt
                  </div>
                )}
                {property.furnished && (
                  <div className="flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    Möbliert
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                {property.description}
              </p>

              {/* Action Button */}
              <div className="flex justify-end">
                <Button variant="outline" className="px-6">
                  Details ansehen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};