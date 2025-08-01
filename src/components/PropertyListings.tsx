import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HorizontalPropertyCard, Property } from "@/components/HorizontalPropertyCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PropertyListings = ({ searchFilters }: { searchFilters?: any }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'newest' | 'area'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProperties();
  }, [sortBy, currentPage, searchFilters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build the query with filters
      let countQuery = supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      let dataQuery = supabase
        .from('properties')
        .select(`
          *,
          city:cities(name),
          property_type:property_types(name)
        `)
        .eq('is_active', true);

      // Apply search filters
      if (searchFilters) {
        if (searchFilters.location) {
          const cityFilter = `city:cities!inner(slug.eq.${searchFilters.location})`;
          countQuery = countQuery.or(cityFilter);
          dataQuery = dataQuery.or(cityFilter);
        }
        if (searchFilters.propertyType) {
          const typeFilter = `property_type:property_types!inner(slug.eq.${searchFilters.propertyType})`;
          countQuery = countQuery.or(typeFilter);
          dataQuery = dataQuery.or(typeFilter);
        }
        if (searchFilters.minPrice) {
          countQuery = countQuery.gte('price_monthly', parseInt(searchFilters.minPrice));
          dataQuery = dataQuery.gte('price_monthly', parseInt(searchFilters.minPrice));
        }
        if (searchFilters.maxPrice) {
          countQuery = countQuery.lte('price_monthly', parseInt(searchFilters.maxPrice));
          dataQuery = dataQuery.lte('price_monthly', parseInt(searchFilters.maxPrice));
        }
        if (searchFilters.minArea) {
          countQuery = countQuery.gte('area_sqm', parseInt(searchFilters.minArea));
          dataQuery = dataQuery.gte('area_sqm', parseInt(searchFilters.minArea));
        }
        if (searchFilters.rooms && searchFilters.rooms !== '5+') {
          countQuery = countQuery.eq('rooms', searchFilters.rooms);
          dataQuery = dataQuery.eq('rooms', searchFilters.rooms);
        } else if (searchFilters.rooms === '5+') {
          countQuery = countQuery.gte('rooms', '5');
          dataQuery = dataQuery.gte('rooms', '5');
        }
      }

      // Get total count
      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      dataQuery = dataQuery.range(from, to);

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          dataQuery = dataQuery.order('price_monthly', { ascending: true });
          break;
        case 'price_high':
          dataQuery = dataQuery.order('price_monthly', { ascending: false });
          break;
        case 'area':
          dataQuery = dataQuery.order('area_sqm', { ascending: false });
          break;
        case 'newest':
        default:
          dataQuery = dataQuery.order('created_at', { ascending: false });
          break;
      }

      const { data, error: fetchError } = await dataQuery;

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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="overflow-hidden bg-white rounded-lg border shadow-sm">
                <div className="flex h-72">
                  <Skeleton className="w-80 h-full rounded-none flex-shrink-0" />
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-6 w-64" />
                    <div className="grid grid-cols-4 gap-6">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="text-center space-y-2">
                          <Skeleton className="h-5 w-5 mx-auto" />
                          <Skeleton className="h-5 w-12 mx-auto" />
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                      ))}
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-end">
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
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
            {totalCount} {totalCount === 1 ? 'Immobilie' : 'Immobilien'} gefunden
            {totalPages > 1 && ` • Seite ${currentPage} von ${totalPages}`}
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

      {/* Property List */}
      {properties.length > 0 ? (
        <>
          <div className="space-y-6">
            {properties.map((property) => (
              <HorizontalPropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Weiter
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
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