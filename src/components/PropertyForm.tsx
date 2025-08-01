import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { PropertyBase, PropertyFormData } from '@/types/property';

interface PropertyFormProps {
  property?: PropertyBase | null;
  onClose: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    address: '',
    postal_code: '',
    neighborhood: '',
    rooms: '',
    area_sqm: 0,
    price_monthly: 0,
    additional_costs_monthly: 0,
    property_type_id: '',
    city_id: '',
    floor: 0,
    total_floors: 0,
    year_built: 0,
    available_from: '',
    deposit_months: 3,
    kitchen_equipped: false,
    furnished: false,
    pets_allowed: false,
    utilities_included: false,
    balcony: false,
    elevator: false,
    parking: false,
    garden: false,
    cellar: false,
    attic: false,
    dishwasher: false,
    washing_machine: false,
    dryer: false,
    tv: false,
    energy_certificate_type: '',
    energy_certificate_value: '',
    heating_type: '',
    heating_energy_source: '',
    internet_speed: '',
    features_description: '',
    additional_description: '',
    is_featured: false,
    is_active: true,
    images: []
  });

  const [cities, setCities] = useState<any[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        available_from: property.available_from ? new Date(property.available_from).toISOString().split('T')[0] : ''
      });
    }
    fetchCitiesAndTypes();
  }, [property]);

  const fetchCitiesAndTypes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const [citiesResponse, typesResponse] = await Promise.all([
        supabase.functions.invoke('admin-management', {
          body: { action: 'get_cities', token }
        }),
        supabase.functions.invoke('admin-management', {
          body: { action: 'get_property_types', token }
        })
      ]);

      if (citiesResponse.data?.cities) setCities(citiesResponse.data.cities);
      if (typesResponse.data?.types) setPropertyTypes(typesResponse.data.types);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const action = property ? 'update_property' : 'create_property';
      
      const propertyData = {
        ...formData,
        available_from: formData.available_from || null
      };

      const requestBody = property 
        ? { action, token, id: property.id, property: propertyData }
        : { action, token, property: propertyData };

      const { data } = await supabase.functions.invoke('admin-management', {
        body: requestBody
      });

      if (data?.property) {
        toast({
          title: "Erfolgreich",
          description: `Immobilie wurde ${property ? 'aktualisiert' : 'erstellt'}.`,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Fehler",
        description: `Immobilie konnte nicht ${property ? 'aktualisiert' : 'erstellt'} werden.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold">
          {property ? 'Immobilie bearbeiten' : 'Neue Immobilie'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rooms">Zimmer *</Label>
                <Input
                  id="rooms"
                  value={formData.rooms}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  placeholder="z.B. 3"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city_id">Stadt *</Label>
                <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stadt auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_type_id">Objektart *</Label>
                <Select value={formData.property_type_id} onValueChange={(value) => setFormData({ ...formData, property_type_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Objektart auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Straße und Hausnummer *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">PLZ</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Stadtteil</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preise & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_monthly">Kaltmiete (€) *</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_costs_monthly">Nebenkosten (€)</Label>
                <Input
                  id="additional_costs_monthly"
                  type="number"
                  value={formData.additional_costs_monthly}
                  onChange={(e) => setFormData({ ...formData, additional_costs_monthly: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_sqm">Wohnfläche (m²) *</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  value={formData.area_sqm}
                  onChange={(e) => setFormData({ ...formData, area_sqm: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Etage</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_floors">Etagen gesamt</Label>
                <Input
                  id="total_floors"
                  type="number"
                  value={formData.total_floors}
                  onChange={(e) => setFormData({ ...formData, total_floors: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_built">Baujahr</Label>
                <Input
                  id="year_built"
                  type="number"
                  value={formData.year_built}
                  onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit_months">Kaution (Monate)</Label>
                <Input
                  id="deposit_months"
                  type="number"
                  value={formData.deposit_months}
                  onChange={(e) => setFormData({ ...formData, deposit_months: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_from">Verfügbar ab</Label>
              <Input
                id="available_from"
                type="date"
                value={formData.available_from}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ausstattung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'kitchen_equipped', label: 'Einbauküche' },
                { key: 'furnished', label: 'Möbliert' },
                { key: 'pets_allowed', label: 'Haustiere erlaubt' },
                { key: 'utilities_included', label: 'NK inklusive' },
                { key: 'balcony', label: 'Balkon' },
                { key: 'elevator', label: 'Aufzug' },
                { key: 'parking', label: 'Parkplatz' },
                { key: 'garden', label: 'Garten' },
                { key: 'cellar', label: 'Keller' },
                { key: 'attic', label: 'Dachboden' },
                { key: 'dishwasher', label: 'Spülmaschine' },
                { key: 'washing_machine', label: 'Waschmaschine' },
                { key: 'dryer', label: 'Trockner' },
                { key: 'tv', label: 'TV' },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={formData[item.key as keyof PropertyFormData] as boolean}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, [item.key]: checked })
                    }
                  />
                  <Label htmlFor={item.key} className="text-sm">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Bild-URL eingeben"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
              />
              <Button type="button" onClick={addImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="truncate">{image}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Aktiv</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
              />
              <Label htmlFor="is_featured">Empfohlen</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Speichere...' : (property ? 'Aktualisieren' : 'Erstellen')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;