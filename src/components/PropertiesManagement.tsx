import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MapPin, Euro, Ruler, Users, Building2 } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';
import { PropertyWithRelations } from '@/types/property';

const PropertiesManagement = () => {
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyWithRelations | null>(null);
  const { toast } = useToast();

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      console.log('Fetching properties with token...');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_properties', token }
      });

      console.log('Properties response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to fetch properties');
      }

      if (data?.properties) {
        console.log('Properties loaded:', data.properties.length);
        setProperties(data.properties);
      } else {
        console.warn('No properties data received');
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Fehler",
        description: "Immobilien konnten nicht geladen werden.",
        variant: "destructive"
      });
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Immobilie löschen möchten?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'delete_property', token, id: propertyId }
      });

      if (data?.success) {
        toast({
          title: "Erfolgreich",
          description: "Immobilie wurde gelöscht.",
        });
        fetchProperties();
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Fehler",
        description: "Immobilie konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (property: PropertyWithRelations) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProperty(null);
    fetchProperties();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Immobilien Verwaltung</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Immobilien werden geladen...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <PropertyForm 
        property={editingProperty}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Immobilien Verwaltung</h1>
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neue Immobilie
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Immobilien gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Fügen Sie Ihre erste Immobilie hinzu, um zu beginnen.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Immobilie hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Property Image */}
                  <div className="flex-shrink-0">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full lg:w-48 h-32 lg:h-24 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full lg:w-48 h-32 lg:h-24 bg-muted rounded-md flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight">{property.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}, {property.city?.name}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 sm:gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(property)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden sm:inline">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(property.id)}
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Löschen</span>
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={property.is_active ? "default" : "secondary"}>
                        {property.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      {property.is_featured && (
                        <Badge variant="outline">Empfohlen</Badge>
                      )}
                      {property.property_type?.name && (
                        <Badge variant="secondary">{property.property_type.name}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold">{formatPrice(property.price_monthly)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-4 w-4 text-primary shrink-0" />
                        <span>{property.area_sqm} m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        <span>{property.rooms} Zimmer</span>
                      </div>
                      <div className="hidden sm:flex items-center text-xs text-muted-foreground">
                        <span>ID: {property.id.slice(0, 8)}...</span>
                      </div>
                    </div>

                    {property.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
                        {property.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesManagement;