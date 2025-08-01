import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, Property } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, SlidersHorizontal, ArrowUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PropertyListings = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'newest' | 'area'>('newest');

  useEffect(() => {
    fetchProperties();
  }, [sortBy]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('properties')
        .select(`
          *,
          city:cities(name),
          property_type:property_types(name)
        `)
        .eq('is_active', true);

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price_monthly', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_monthly', { ascending: false });
          break;
        case 'area':
          query = query.order('area_sqm', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Fehler beim Laden der Immobilien. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'price_low': return 'Preis aufsteigend';
      case 'price_high': return 'Preis absteigend';
      case 'area': return 'Größe';
      case 'newest': return 'Neueste zuerst';
      default: return 'Sortieren';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Verfügbare Immobilien
          </h2>
          <p className="text-muted-foreground">
            {properties.length} {properties.length === 1 ? 'Immobilie' : 'Immobilien'} gefunden
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">Neueste zuerst</option>
            <option value="price_low">Preis aufsteigend</option>
            <option value="price_high">Preis absteigend</option>
            <option value="area">Nach Größe</option>
          </select>
        </div>
      </div>

      {/* Property Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Keine Immobilien gefunden
            </h3>
            <p className="text-muted-foreground mb-4">
              Derzeit sind keine Immobilien verfügbar, die Ihren Suchkriterien entsprechen.
            </p>
            <Button variant="outline" onClick={fetchProperties}>
              Erneut laden
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};