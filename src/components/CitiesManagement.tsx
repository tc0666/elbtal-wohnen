import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin, Edit, Save, X, Trash2 } from 'lucide-react';

interface City {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

const CitiesManagement = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    display_order: 0,
    is_active: true
  });
  const { toast } = useToast();

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      console.log('Fetching cities with token...');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_cities', token }
      });

      console.log('Cities response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to fetch cities');
      }

      if (data?.cities) {
        console.log('Cities loaded:', data.cities.length);
        setCities(data.cities);
      } else {
        console.warn('No cities data received');
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Fehler",
        description: "Städte konnten nicht geladen werden.",
        variant: "destructive"
      });
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const cityData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      };

      const action = editingCity ? 'update_city' : 'create_city';
      const requestBody = editingCity 
        ? { action, token, cityId: editingCity, city: cityData }
        : { action, token, city: cityData };

      const { data } = await supabase.functions.invoke('admin-management', {
        body: requestBody
      });

      if (data?.city || data?.success) {
        toast({
          title: "Erfolgreich",
          description: editingCity ? "Stadt wurde aktualisiert." : "Stadt wurde hinzugefügt.",
        });
        resetForm();
        fetchCities();
      }
    } catch (error) {
      console.error('Error saving city:', error);
      toast({
        title: "Fehler",
        description: editingCity ? "Stadt konnte nicht aktualisiert werden." : "Stadt konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (city: City) => {
    setFormData({
      name: city.name,
      slug: city.slug,
      display_order: city.display_order,
      is_active: city.is_active
    });
    setEditingCity(city.id);
    setShowForm(true);
  };

  const handleDelete = async (cityId: string, cityName: string) => {
    if (!confirm(`Sind Sie sicher, dass Sie die Stadt "${cityName}" löschen möchten?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'delete_city', token, cityId }
      });

      if (data?.success) {
        toast({
          title: "Erfolgreich",
          description: "Stadt wurde gelöscht.",
        });
        fetchCities();
      }
    } catch (error) {
      console.error('Error deleting city:', error);
      toast({
        title: "Fehler",
        description: "Stadt konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', display_order: 0, is_active: true });
    setShowForm(false);
    setEditingCity(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Städte Verwaltung</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Städte werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Städte Verwaltung</h1>
        <Button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2"
          disabled={showForm}
        >
          <Plus className="h-4 w-4" />
          Neue Stadt
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCity ? 'Stadt bearbeiten' : 'Neue Stadt hinzufügen'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Stadtname *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    placeholder="z.B. München"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL-Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="z.B. muenchen"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_order">Anzeigereihenfolge</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingCity ? 'Änderungen speichern' : 'Stadt speichern'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <Card key={city.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{city.name}</CardTitle>
                </div>
                <Badge variant={city.is_active ? "default" : "secondary"}>
                  {city.is_active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Slug:</span> {city.slug}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Reihenfolge:</span> {city.display_order}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(city)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Bearbeiten
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(city.id, city.name)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cities.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Städte gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Fügen Sie Ihre erste Stadt hinzu, um zu beginnen.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Stadt hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CitiesManagement;