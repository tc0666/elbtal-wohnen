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
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_properties', token }
      });

      if (data?.properties) {
        setProperties(data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Fehler",
        description: "Immobilien konnten nicht geladen werden.",
        variant: "destructive"
      });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Immobilien Verwaltung</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neue Immobilie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {property.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={property.is_active ? "default" : "secondary"}>
                      {property.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    {property.is_featured && (
                      <Badge variant="outline">Empfohlen</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(property)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(property.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address}, {property.city?.name}
              </div>
              
              <div className="flex items-center text-sm">
                <Badge variant="secondary">
                  {property.property_type?.name}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center">
                  <Euro className="h-4 w-4 mr-1 text-primary" />
                  <span>{formatPrice(property.price_monthly)}</span>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 mr-1 text-primary" />
                  <span>{property.area_sqm} m²</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-primary" />
                  <span>{property.rooms}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
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
      )}
    </div>
  );
};

export default PropertiesManagement;